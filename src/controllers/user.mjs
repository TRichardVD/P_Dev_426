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
  const listid = req.params.id;
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
  const listId = req.params.id;
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

export { insertList, dropList, modifyList };
