import express from "express";
import path from "path";
import { GetSite, GetSiteById } from "../controllers/sites.mjs";

const siteRouter = express();
siteRouter.set("views", path.resolve("src/views"));
siteRouter.get("/", GetSite);

siteRouter.get("/:id", GetSiteById);

siteRouter.post("/comment", (res, req) => {
  const { user_id, comment, date } = req.body;
  const { place_id } = req.params.id;
  if (!comment || !place_id) {
    return res
      .status(400)
      .json({ message: "Le commentaire ne peut pas être vide" });
  }
  const newComment = new Comment({
    user_id: ObjectId(user_id),
    comment: comment,
    date: date,
  });
});

export { siteRouter };
