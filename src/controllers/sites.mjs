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
        const comments = await getCommentsBySiteId(id);
        if (!site) {
            return res.status(404).json({ error: "Site not found" });
        }
        const result = {
            _id: site._id,
            name: site.name,
            description: site.description,
            coordinates: site.coordinates,
            images: site.images,
            comments: comments,
        };
        console.log(result);
        return res.render("detailed-view", { site: result });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
}

export { GetSite, GetSiteById };
