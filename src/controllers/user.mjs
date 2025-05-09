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
  const listExists = await List.findAll({ name, user: userId });
  if (listExists) {
    errors.list = {
      message: "Le nom de liste est déjà utilisé, essayez-en un autre.",
      value: name,
    };
  }

  const list = new List({
    name: name,
    color: color,
    user: userId,
  });
  await list.save().catch((_) => {
    return res.redirect(
      `/list?err=${encodeURIComponent(
        "Une erreur est survenue lors de la création de la liste."
      )}`
    );
  });
  return res.redirect(
    `/list?success=${encodeURIComponent("La liste a été crée avec succès")}`
  );
}
function dropList(req, res) {
  const listId = req.params.listId;
  if (!listId) {
    return res.redirect(
      `/list?err=${encodeURIComponent("L'id de la liste doit être spécifiés.")}`
    );
  }
  List.deleteOne({
    _id: listId,
  })
    .then((_) => {
      res.redirect(
        `/list?success=${encodeURIComponent(
          "La liste a été supprimée avec succès"
        )}`
      );
    })
    .catch((_) => {
      return res.redirect(
        `/list?err=${encodeURIComponent(
          "Une erreur est survenue lors de la suppression de la liste."
        )}`
      );
    });
}

function modifyList(req, res) {
  const listId = req.params.listId;
  if (!listId) {
    return res.redirect(
      `/list?err=${encodeURIComponent("L'id de la liste doit être spécifiés.")}`
    );
  }
  const { name, color } = req.body;
  List.updateOne(
    {
      _id: listId,
    },
    {
      name: name,
      color: color,
    }
  )
    .then((_) => {
      res.redirect(
        `/list?success=${encodeURIComponent(
          "La liste a été modifiée avec succès"
        )}`
      );
    })
    .catch((_) => {
      return res.redirect(
        `/list?err=${encodeURIComponent(
          "Une erreur est survenue lors de la modification de la liste."
        )}`
      );
    });
}

function insertSiteToList(req, res) {
  const listId = req.params.listId;
  const siteId = req.params.siteId;
  if (!listId || !siteId) {
    return res.redirect(
      `/list?err=${encodeURIComponent(
        "L'id de la liste et l'id du site doivent être spécifiés."
      )}`
    );
  }

  List.updateone(
    {
      _id: listId,
    },
    {
      $push: {
        sites: siteId,
      },
    }
  )
    .then((_) => {
      res.redirect(
        `/list?success=${encodeURIComponent(
          "Le site a été ajouté avec succès"
        )}`
      );
    })
    .catch((_) => {
      return res.redirect(
        `/list?err=${encodeURIComponent(
          "Une erreur est survenue lors de l'ajout du site."
        )}`
      );
    });
}

function dropSiteFromList(req, res) {
  const listId = req.params.listId;
  const siteId = req.params.siteId;
  List.updateone(
    {
      _id: listId,
    },
    {
      $pull: {
        sites: siteId,
      },
    }
  )
    .then((_) => {
      res.redirect(
        `/list?success=${encodeURIComponent(
          "Le site a été retiré avec succès"
        )}`
      );
    })
    .catch((_) => {
      return res.redirect(
        `/list?err=${encodeURIComponent(
          "Une erreur est survenue lors du retrait du site."
        )}`
      );
    });
}

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

export {
  insertList,
  dropList,
  modifyList,
  insertSiteToList,
  dropSiteFromList,
  GetUserProfile,
  renderEditProfile,
  updateProfile,
};
