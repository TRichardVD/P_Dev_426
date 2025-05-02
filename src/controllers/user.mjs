import User from "../models/user.mjs";

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

export { GetUserProfile };
