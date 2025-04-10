import Comment from "../models/comment.mjs";
import mongoose from "mongoose"; // Correct import for ObjectId
import Site from "../models/site.mjs";

const { ObjectId } = mongoose.Types; // Extract ObjectId from mongoose.Types

async function addComment(req, res) {
    console.log("addComment", req.body, req.params);
    const comment = req.body.comment;
    const place_id = req.params.id;
    if (!comment || !place_id) {
        return res
            .status(400)
            .json({ message: "Le commentaire ne peut pas être vide" });
    }

    if (!req.user) {
        return res.status(401).json({
            message: "Vous devez être connecté pour laisser un commentaire",
        });
    }

    const place = await Site.findOne({ _id: new ObjectId(place_id) })
        .populate("comments")
        .exec();
    if (!place) {
        return res.status(404).json({ message: "Site non trouvé" });
    }
    const commentCreated = new Comment({
        user_username: req.user.username,
        user_id: req.user.id,
        site_id: place_id,
        comment: comment,
        date: Date.now(),
    });
    console.log("commentCreated", commentCreated);
    try {
        await commentCreated.save();
        place.comments.push(commentCreated._id);
        place.save();
    } catch (err) {
        console.error("Error saving comment:", err);
        return res.status(500).json({
            message: "Erreur lors de la création du commentaire",
            error: err.message,
        });
    }
    return res.status(201).json({
        message: "Commentaire créé avec succès",
        comment: commentCreated,
    });
}

const getCommentsBySiteId = async (site_id) => {
    const siteId = site_id;
    try {
        const comments = await Comment.find({ site_id: siteId })
            .populate("user_id", "username")
            .exec();
        const result = comments.map((comment) => ({
            id: comment._id,
            user_id: comment.user_id._id,
            user_username: comment.user_username,
            comment: comment.comment,
            date: comment.date,
        }));
        console.log("result", result);
        return result;
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw new Error("Error fetching comments");
    }
};

export { addComment, getCommentsBySiteId };
