import mongoose from "mongoose";
const { Schema, Types } = mongoose;

// Schéma pour le commentaire
const CommentSchema = new Schema({
  user_username: { type: String, required: true }, // Le nom d'utilisateur de l'utilisateur qui a commenté
  user_id: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  }, // Référence à l'utilisateur
  comment: { type: String, required: true }, // Le commentaire de l'utilisateur
  site_id: {
    type: Types.ObjectId,
    ref: "Site",
    required: true,
  },
  date: { type: Date, default: Date.now }, // La date du commentaire
  likes: [{ type: Types.ObjectId, ref: "User" }],
  dislikes: [{ type: Types.ObjectId, ref: "User" }],
  score: { type: Number, default: 0 },
});

// Methods to handle likes/dislikes
CommentSchema.methods.toggleLike = async function (userId) {
  const hasLiked = this.likes.includes(userId);
  const hasDisliked = this.dislikes.includes(userId);

  if (hasLiked) {
    this.likes.pull(userId);
  } else {
    if (hasDisliked) this.dislikes.pull(userId);
    this.likes.push(userId);
  }

  this.score = this.likes.length - this.dislikes.length;
  return this.save();
};

CommentSchema.methods.toggleDislike = async function (userId) {
  const hasLiked = this.likes.includes(userId);
  const hasDisliked = this.dislikes.includes(userId);

  if (hasDisliked) {
    this.dislikes.pull(userId);
  } else {
    if (hasLiked) this.likes.pull(userId);
    this.dislikes.push(userId);
  }

  this.score = this.likes.length - this.dislikes.length;
  return this.save();
};

const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
