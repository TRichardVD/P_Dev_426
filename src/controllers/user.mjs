import List from "../models/list.mjs";
import User from "../models/user.mjs";
import bcrypt from "bcrypt";

async function insertList(req, res) {
  const { name, color } = req.body;
  const userId = req.user.id;

  if (!name || !color) {
    return res.redirect(
      `/list?err=${encodeURIComponent(
        "Tous les champs doivent être spécifiés."
      )}`
    );
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.redirect(
        `/list?err=${encodeURIComponent("Utilisateur non trouvé.")}`
      );
    }

    const listExists = user.lists.some((list) => list.name === name);

    if (listExists) {
      return res.redirect(
        `/list?err=${encodeURIComponent(
          "Le nom de liste est déjà utilisé, essayez-en un autre."
        )}`
      );
    }

    user.lists.push({ name, color, sites: [] });
    await user.save();

    return res.redirect(
      `/list?success=${encodeURIComponent("La liste a été créée avec succès")}`
    );
  } catch (err) {
    console.error("Erreur lors de la création de la liste :", err);
    return res.redirect(
      `/list?err=${encodeURIComponent(
        "Une erreur est survenue lors de la création de la liste."
      )}`
    );
  }
}

async function dropList(req, res) {
  const userId = req.user.id;
  const { listId } = req.params;

  if (!listId) {
    return res.redirect(
      `/list?err=${encodeURIComponent("L'id de la liste doit être spécifié.")}`
    );
  }

  try {
    await User.updateOne(
      { _id: userId },
      { $pull: { lists: { _id: listId } } }
    );
    res.redirect(
      `/list?success=${encodeURIComponent(
        "La liste a été supprimée avec succès."
      )}`
    );
  } catch (err) {
    res.redirect(
      `/list?err=${encodeURIComponent(
        "Erreur lors de la suppression de la liste."
      )}`
    );
  }
}

async function modifyList(req, res) {
  const userId = req.user.id;
  const { listId } = req.params;
  const { name, color } = req.body;

  if (!listId) {
    return res.redirect(
      `/list?err=${encodeURIComponent("L'id de la liste doit être spécifié.")}`
    );
  }

  try {
    await User.updateOne(
      { _id: userId, "lists._id": listId },
      {
        $set: {
          "lists.$.name": name,
          "lists.$.color": color,
        },
      }
    );
    res.redirect(
      `/list?success=${encodeURIComponent(
        "La liste a été modifiée avec succès."
      )}`
    );
  } catch (err) {
    res.redirect(
      `/list?err=${encodeURIComponent(
        "Erreur lors de la modification de la liste."
      )}`
    );
  }
}

async function insertSiteToList(req, res) {
  const userId = req.user.id;
  const { listId, siteId } = req.params;

  if (!listId || !siteId) {
    return res.redirect(
      `/list?err=${encodeURIComponent("Les IDs doivent être spécifiés.")}`
    );
  }

  try {
    await User.updateOne(
      { _id: userId, "lists._id": listId },
      {
        $addToSet: {
          "lists.$.sites": siteId,
        },
      }
    );
    res.redirect(
      `/list?success=${encodeURIComponent("Le site a été ajouté avec succès.")}`
    );
  } catch (err) {
    res.redirect(
      `/list?err=${encodeURIComponent("Erreur lors de l'ajout du site.")}`
    );
  }
}

async function dropSiteFromList(req, res) {
  const userId = req.user.id;
  const { listId, siteId } = req.params;

  if (!listId || !siteId) {
    return res.redirect(
      `/list?err=${encodeURIComponent("Les IDs doivent être spécifiés.")}`
    );
  }

  try {
    await User.updateOne(
      { _id: userId, "lists._id": listId },
      {
        $pull: {
          "lists.$.sites": siteId,
        },
      }
    );
    res.redirect(
      `/list?success=${encodeURIComponent("Le site a été retiré avec succès.")}`
    );
  } catch (err) {
    res.redirect(
      `/list?err=${encodeURIComponent("Erreur lors du retrait du site.")}`
    );
  }
}

async function GetUserProfile(req, res) {
  try {
    // Récupérer l'utilisateur connecté
    const userId = req.user.id; // Assurez-vous que `req.user` est défini par le middleware d'authentification
    const user = await User.findById(userId)
      .populate("likedSites") // Peupler les sites aimés
      .populate("comments")
      .populate("lists"); // Peupler les commentaires

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
      lists: user.lists.map((list) => ({
        id: list._id,
        name: list.name,
        color: list.color,
      })),
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
    const { username, email } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();
    res.status(200).json({ message: "Profil mis à jour avec succès" });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du profil :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function resetPassword(req, res) {
  try {
    const { newPassword } = req.body;

    // Vérification du champ
    if (!newPassword) {
      return res
        .status(400)
        .json({ error: "Le nouveau mot de passe est requis." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }

    // Récupérer l'utilisateur connecté
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Supprimer toutes les sessions de l'utilisateur
    user.sessions = [];
    await user.save();

    // Supprimer le cookie d'authentification
    res.clearCookie("token", {
      httpOnly: true,
      secure: true, // Assurez-vous que cette option est activée si vous utilisez HTTPS
      sameSite: "none", // Si vous utilisez des cookies cross-origin
    });

    // Rediriger vers la page de connexion
    return res.redirect(
      `/login?success=${encodeURIComponent(
        "Mot de passe réinitialisé avec succès. Veuillez vous reconnecter."
      )}`
    );
  } catch (err) {
    console.error("Erreur lors de la réinitialisation du mot de passe :", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function renderResetPasswordForm(req, res) {
  try {
    // Rendre la vue du formulaire de réinitialisation
    res.render("auth/reset-password-form", { errors: {} });
  } catch (err) {
    console.error("Erreur lors du rendu du formulaire :", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

export {
  resetPassword,
  insertList,
  dropList,
  modifyList,
  insertSiteToList,
  dropSiteFromList,
  GetUserProfile,
  renderEditProfile,
  updateProfile,
  renderResetPasswordForm,
};
