import express from "express";
import path from "path";
import { authReq } from "../controllers/auth.mjs";
import {
  GetUserProfile,
  renderEditProfile,
  updateProfile,
  insertList,
  dropList,
  modifyList,
  insertSiteToList,
  dropSiteFromList,
  getSiteList,
} from "../controllers/user.mjs";

const userRouter = express();
userRouter.set("views", path.resolve("src/views"));

userRouter.get("/profile", authReq, GetUserProfile);

// Route pour afficher la page d'édition du profil
userRouter.get("/edit-profile", authReq, renderEditProfile);

// Route pour mettre à jour les données du profil
userRouter.post("/edit-profile", authReq, updateProfile);

userRouter.post("/list", authReq, insertList);
userRouter.delete("/list/:listId", dropList);
userRouter.put("/list/:listId", modifyList);
userRouter.post("/list/:listId/site/:siteId", insertSiteToList);
userRouter.delete("/list/:listId/site/:siteId", dropSiteFromList);
userRouter.get("/list/:listId", authReq, getSiteList);

export { userRouter };
