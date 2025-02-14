import express from 'express';
import { Register } from '../controllers/auth.mjs';
const userRouter = express();

userRouter.post('/register', Register);

export { userRouter };
