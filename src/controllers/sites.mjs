import Site from "../models/site.mjs";
import { getCommentsBySiteId } from "./comments.mjs";

async function GetSite(req, res) {
    const { query } = req.query;
    if (!query) {
        Site.find()
            .limit(20)
            .then((sites) => {
                return res.render("search", { results: sites, query: null });
            });
    } else {
        Site.find(
            {
                $or: [{ $text: { $search: query } }],
            },
            { score: { $meta: "textScore" } }
        )
            .sort({ score: { $meta: "textScore" } })
            .then((sites) => {
                return res.render("search", { results: sites, query });
            })
            .catch((err) => {
                return res.status(500).json({ error: err.message });
            });
    }
}

async function GetSiteById(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Site ID is required" });
    }

    try {
        const site = await Site.findOne({ _id: id });
        if (!site) {
            return res.status(404).json({ error: "Site not found" });
        }

        const comments = await getCommentsBySiteId(id);

        const enhancedComments = comments.map((comment) => ({
            ...comment,
            userHasLiked: req.user
                ? comment.likes.includes(req.user.id)
                : false,
            userHasDisliked: req.user
                ? comment.dislikes.includes(req.user.id)
                : false,
        }));

        const result = {
            _id: site._id,
            name: site.name,
            description: site.description,
            coordinates: site.coordinates,
            images: site.images,
            comments: enhancedComments,
            user: req.user ? { id: req.user.id } : null,
        };

        return res.render("detailed-view", { site: result });
    } catch (err) {
        console.error("Error in GetSiteById:", err);
        return res.status(500).json({ error: err.message });
    }
}

export { GetSite, GetSiteById };
