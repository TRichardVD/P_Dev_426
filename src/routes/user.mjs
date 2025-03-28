import express from 'express';
import { Register, Login, Logout } from '../controllers/auth.mjs';
import { authReq } from '../controllers/auth.mjs';

const userRouter = express();

userRouter.post('/register', Register);
userRouter.post('/login', Login);
userRouter.post('/logout', authReq, Logout);

export { userRouter };
