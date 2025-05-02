import List from "../models/list.mjs";

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
  const listid = req.params.listId;
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

export { insertList, dropList, modifyList, insertSiteToList, dropSiteFromList };
