import mongoose from 'mongoose';
import { type } from 'os';
const { Schema, Types } = mongoose;

// Schéma pour l'utilisateur
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    likedSites: [{ type: Types.ObjectId, ref: 'Site', default: [] }], // Liste des sites aimés par l'utilisateur
    comments: [
        {
            type: Types.ObjectId,
            ref: 'Comment',
            default: [],
        },
    ],
    sessions: [{ type: String, default: [] }], // Liste des sessions de l'utilisateur
    password: { type: String, required: true, minlength: 6 }, // Le mot de passe avec une validation de longueur
});

// Modèle Mongoose pour l'utilisateur
const User = mongoose.model('User', UserSchema);

export default User;
