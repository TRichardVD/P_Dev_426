import Comment from "../models/comment.mjs";

async function addComment(req, res) {
  const comment = req.body;
  const { place_id } = req.params.id;
  if (!comment || !place_id) {
    return res
      .status(400)
      .json({ message: "Le commentaire ne peut pas être vide" });
  }
}
const comment = new Comment({
  user_id: ObjectId(user_id),
  comment: comment,
  date: date,
});

export { addComment };
