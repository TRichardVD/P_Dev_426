import express from "express";
import path from "path";
import { authReq } from "../controllers/auth.mjs";
import { GetUserProfile } from "../controllers/user.mjs";

const userRouter = express();
userRouter.set("views", path.resolve("src/views"));

userRouter.get("/profile", authReq, GetUserProfile);

export { userRouter };
