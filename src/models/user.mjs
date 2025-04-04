import mongoose from "mongoose";
const { Schema } = mongoose;

// Schéma pour l'utilisateur
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
  },
  password: { type: String, required: true, minlength: 6 }, // Le mot de passe avec une validation de longueur
});

// Modèle Mongoose pour l'utilisateur
const User = mongoose.model("User", UserSchema);

export default User;
