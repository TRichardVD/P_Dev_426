import mongoose from 'mongoose';
const { Schema } = mongoose;

// Schéma pour le commentaire
const CommentSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }, // Référence à l'utilisateur
  comment: { type: String, required: true }, // Le commentaire de l'utilisateur
  date: { type: Date, default: Date.now }, // La date du commentaire
});

// Schéma pour le site
const SiteSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String },
  description: { type: String },
  country: [{ type: String }],
  likes_count: { type: Number, default: 0 }, // Nombre de likes pour ce site
  comments: [CommentSchema], // Liste des commentaires associés au site
});

// Modèle Mongoose pour le site
const Site = mongoose.model('Site', SiteSchema);

export default Site;
