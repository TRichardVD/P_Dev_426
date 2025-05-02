import User from "../models/user.mjs";
import bcrypt from "bcrypt";

async function GetUserProfile(req, res) {
  try {
    // Récupérer l'utilisateur connecté
    const userId = req.user.id; // Assurez-vous que `req.user` est défini par le middleware d'authentification
    const user = await User.findById(userId)
      .populate("likedSites") // Peupler les sites aimés
      .populate("comments"); // Peupler les commentaires

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Préparer les données pour la vue
    const userData = {
      username: user.username, // Nom d'utilisateur
      email: user.email, // Adresse email
      likedSites: user.likedSites.map((site) => ({
        id: site._id,
        name: site.name,
        description: site.description,
        images: site.images,
      })), // Liste des sites aimés
      comments: user.comments.map((comment) => ({
        id: comment._id,
        content: comment.content,
        createdAt: comment.createdAt,
      })), // Liste des commentaires
      sessions: user.sessions, // Liste des sessions
    };

    // Rendre la vue `profile`
    return res.render("profile", { user: userData });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

async function renderEditProfile(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }
    res.render("edit-profile", { user });
  } catch (err) {
    console.error("Erreur lors du rendu de la page d'édition :", err);
    res.status(500).send("Erreur serveur");
  }
}

// Mettre à jour les données du profil
async function updateProfile(req, res) {
  try {
    const { username, email, password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.redirect("/profile");
  } catch (err) {
    console.error("Erreur lors de la mise à jour du profil :", err);
    res.status(500).send("Erreur serveur");
  }
}

export { GetUserProfile, renderEditProfile, updateProfile };
