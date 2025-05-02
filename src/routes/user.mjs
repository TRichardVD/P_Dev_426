import express from "express";
import path from "path";
import { authReq } from "../controllers/auth.mjs";
import {
  GetUserProfile,
  renderEditProfile,
  updateProfile,
} from "../controllers/user.mjs";

const userRouter = express();
userRouter.set("views", path.resolve("src/views"));

userRouter.get("/profile", authReq, GetUserProfile);

// Route pour afficher la page d'édition du profil
userRouter.get("/edit-profile", authReq, renderEditProfile);

// Route pour mettre à jour les données du profil
userRouter.post("/edit-profile", authReq, updateProfile);

export { userRouter };
