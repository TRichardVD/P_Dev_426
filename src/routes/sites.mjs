import express from 'express';
import path from 'path';
import { GetSite, GetSiteById } from '../controllers/sites.mjs';
import { authReq } from '../controllers/auth.mjs';
import { addComment } from '../controllers/comments.mjs';

const siteRouter = express();
siteRouter.set('views', path.resolve('src/views'));
siteRouter.get('/', GetSite);

siteRouter.get('/:id', GetSiteById);

siteRouter.post('/:id/comment', authReq, addComment);

export { siteRouter };
