import mongoose from 'mongoose';
const { Schema } = mongoose;

// Schéma pour le commentaire
const CommentSchema = new Schema({
    place_id: { type: Number, required: true }, // ID du lieu (comme récupéré de l'API externe)
    comment: { type: String, required: true }, // Le commentaire de l'utilisateur
    date: { type: Date, default: Date.now }, // La date du commentaire
});

// Schéma pour l'utilisateur
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: { type: String, required: true, minlength: 6 }, // Le mot de passe avec une validation de longueur
    sessions: [{ type: String }], // Liste des id de session actifs de l'utilisateur (pour la déconnexion)
    likes: [CommentSchema], // Liste de commentaires et likes pour chaque lieu
});

// Modèle Mongoose pour l'utilisateur
const User = mongoose.model('User', UserSchema);

export default User;
