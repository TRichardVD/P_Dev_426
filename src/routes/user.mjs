import express from "express";
import {
  insertList,
  dropList,
  modifyList,
  insertSiteToList,
  dropSiteFromList,
} from "../controllers/user.mjs";

const userRouter = express();

userRouter.post("/list", insertList);
userRouter.delete("/list/:listId", dropList);
userRouter.put("/list/:listId", modifyList);
userRouter.post("/list/:listId/site/:siteId", insertSiteToList);
userRouter.delete("/list/:listId/site/:siteId", dropSiteFromList);

export { userRouter };
