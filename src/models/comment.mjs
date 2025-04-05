import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

// Schéma pour le commentaire
const CommentSchema = new Schema({
    user_id: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    }, // Référence à l'utilisateur
    comment: { type: String, required: true }, // Le commentaire de l'utilisateur
    site_id: {
        type: Types.ObjectId,
        ref: 'Site',
        required: true,
    },
    date: { type: Date, default: Date.now }, // La date du commentaire
});
const Comment = mongoose.model('Comment', CommentSchema);
export default Comment;
