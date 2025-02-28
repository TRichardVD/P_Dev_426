import express from 'express';
import { Register, Login } from '../controllers/auth.mjs';
const userRouter = express();

userRouter.post('/register', Register);
userRouter.post('/login', Login);

export { userRouter };
