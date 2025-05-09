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
  resetPassword,
  renderResetPasswordForm,
} from "../controllers/user.mjs";

const userRouter = express();
userRouter.set("views", path.resolve("src/views"));

userRouter.get("/profile", authReq, GetUserProfile);

// Route pour afficher la page d'édition du profil
userRouter.get("/edit-profile", authReq, renderEditProfile);

// Route pour mettre à jour les données du profil
userRouter.post("/edit-profile", authReq, updateProfile);

userRouter.post("/list", insertList);
userRouter.delete("/list/:listId", dropList);
userRouter.put("/list/:listId", modifyList);
userRouter.post("/list/:listId/site/:siteId", insertSiteToList);
userRouter.delete("/list/:listId/site/:siteId", dropSiteFromList);

// Route pour réinitialiser le mot de passe
userRouter.get("/reset-password", authReq, renderResetPasswordForm);
userRouter.post("/reset-password", authReq, resetPassword);

export { userRouter };
