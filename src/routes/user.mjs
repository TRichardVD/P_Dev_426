import express from "express";
import { insertList, dropList, modifyList } from "../controllers/user.mjs";

const userRouter = express();

userRouter.post("/list", insertList);
userRouter.delete("/list", dropList);
userRouter.put("/list", modifyList);

export { userRouter };
