import express from 'express';
import { Register } from '../controllers/auth.mjs';
const userRouter = express();

userRouter.get('/register', Register);

export { userRouter };
