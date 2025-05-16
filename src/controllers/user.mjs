import User from '../models/user.mjs';
import bcrypt from 'bcrypt';

async function insertList(req, res) {
    const { name, color } = req.body;
    const userId = req.user.id;

    if (!name || !color) {
        return res.redirect(
            `/list?err=${encodeURIComponent(
                'Tous les champs doivent être spécifiés.'
            )}`
        );
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.redirect(
                `/list?err=${encodeURIComponent('Utilisateur non trouvé.')}`
            );
        }

        const listExists = user.lists.some((list) => list.name === name);

        if (listExists) {
            return res.redirect(
                `/list?err=${encodeURIComponent(
                    'Le nom de liste est déjà utilisé, essayez-en un autre.'
                )}`
            );
        }

        user.lists.push({ name, color, sites: [] });
        await user.save();

        return res.redirect(
            `/user/profile?success=${encodeURIComponent(
                'La liste a été créée avec succès'
            )}`
        );
    } catch (err) {
        console.error('Erreur lors de la création de la liste :', err);
        return res.redirect(
            `/list?err=${encodeURIComponent(
                'Une erreur est survenue lors de la création de la liste.'
            )}`
        );
    }
}

async function dropList(req, res) {
    const userId = req.user.id;
    const { listId } = req.params;
    if (!listId) {
        return res.redirect(
            `/list?err=${encodeURIComponent(
                "L'id de la liste doit être spécifié."
            )}`
        );
    }

    try {
        await User.updateOne(
            { _id: userId },
            { $pull: { lists: { _id: listId } } }
        );
    } catch (err) {
        res.redirect(
            `/list?err=${encodeURIComponent(
                'Erreur lors de la suppression de la liste.'
            )}`
        );
    }
    return res.redirect(
        `/user/profile?success=${encodeURIComponent(
            'Le site a été retiré avec succès.'
        )}`
    );
}

async function modifyList(req, res) {
    const userId = req.user.id;
    const { listId } = req.params;
    const { name, color } = req.body;

    if (!listId) {
        return res.redirect(
            `/list?err=${encodeURIComponent(
                "L'id de la liste doit être spécifié."
            )}`
        );
    }

    try {
        await User.updateOne(
            { _id: userId, 'lists._id': listId },
            {
                $set: {
                    'lists.$.name': name,
                    'lists.$.color': color,
                },
            }
        );
        res.redirect(
            `/list?success=${encodeURIComponent(
                'La liste a été modifiée avec succès.'
            )}`
        );
    } catch (err) {
        res.redirect(
            `/list?err=${encodeURIComponent(
                'Erreur lors de la modification de la liste.'
            )}`
        );
    }
}

async function insertSiteToList(req, res) {
    const userId = req.user.id;
    const { listId, siteId } = req.params;

    if (!listId || !siteId) {
        return res.redirect(
            `/list?err=${encodeURIComponent('Les IDs doivent être spécifiés.')}`
        );
    }

    try {
        await User.updateOne(
            { _id: userId, 'lists._id': listId },
            {
                $addToSet: {
                    'lists.$.sites': siteId,
                },
            }
        );
        res.redirect(
            `/site/${siteId}?success=${encodeURIComponent(
                'Le site a été ajouté avec succès.'
            )}`
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
            `/list?err=${encodeURIComponent('Les IDs doivent être spécifiés.')}`
        );
    }

    try {
        await User.updateOne(
            { _id: userId, 'lists._id': listId },
            {
                $pull: {
                    'lists.$.sites': siteId,
                },
            }
        );
    } catch (err) {
        res.redirect(
            `/list?err=${encodeURIComponent('Erreur lors du retrait du site.')}`
        );
    }
    return res.redirect(
        `/user/list/${listId}?success=${encodeURIComponent(
            'Le site a été retiré avec succès.'
        )}`
    );
}

async function GetUserProfile(req, res) {
    try {
        // Récupérer l'utilisateur connecté
        const userId = req.user.id; // Assurez-vous que `req.user` est défini par le middleware d'authentification
        const user = await User.findById(userId)
            .populate('likedSites') // Peupler les sites aimés
            .populate('comments')
            .populate('lists'); // Peupler les commentaires

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
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
        return res.render('profile', {
            user: userData,
            isLoggedIn: req.isLoggedIn,
        });
    } catch (err) {
        console.error('Error fetching user profile:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

async function renderEditProfile(req, res) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send('Utilisateur non trouvé');
        }
        res.render('edit-profile', { user, isLoggedIn: req.isLoggedIn });
    } catch (err) {
        console.error("Erreur lors du rendu de la page d'édition :", err);
        res.status(500).send('Erreur serveur');
    }
}

// Mettre à jour les données du profil
async function updateProfile(req, res) {
    try {
        const { username, email, password } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send('Utilisateur non trouvé');
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.redirect('/profile');
    } catch (err) {
        console.error('Erreur lors de la mise à jour du profil :', err);
        res.status(500).send('Erreur serveur');
    }
}
async function getSiteList(req, res) {
    const userId = req.user.id;
    const { listId } = req.params;

    if (!listId) {
        return res.redirect(
            `/list?err=${encodeURIComponent(
                "L'id de la liste doit être spécifié."
            )}`
        );
    }

    try {
        const user = await User.findById(userId).populate('lists.sites');

        if (!user) {
            return res.redirect(
                `/list?err=${encodeURIComponent('Utilisateur non trouvé.')}`
            );
        }

        const list = user.lists.find((list) => list._id.toString() === listId);

        if (!list) {
            return res.redirect(
                `/list?err=${encodeURIComponent('Liste non trouvée.')}`
            );
        }

        return res.render('site-list', { list });
    } catch (err) {
        console.error('Erreur lors de la récupération de la liste :', err);
        return res.redirect(
            `/list?err=${encodeURIComponent(
                'Erreur lors de la récupération de la liste.'
            )}`
        );
    }
}

async function getSiteLists(req, res) {
    const userId = req.user.id;

    if (!userId) {
        return res.redirect(
            `/list?err=${encodeURIComponent('Utilisateur non trouvé.')}`
        );
    }

    try {
        const user = await User.findById(userId).populate('lists.sites');

        if (!user) {
            return res.redirect(
                `/list?err=${encodeURIComponent('Utilisateur non trouvé.')}`
            );
        }

        return res.json(user.lists);
    } catch (err) {
        console.error('Erreur lors de la récupération des listes :', err);
        return res.redirect(
            `/list?err=${encodeURIComponent(
                'Erreur lors de la récupération des listes.'
            )}`
        );
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
    getSiteList,
    getSiteLists,
};
