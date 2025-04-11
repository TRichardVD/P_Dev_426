import express from 'express';
import path from 'path';
import {
    GetSite,
    GetSiteById,
    toggleLike,
    getSitesApi,
} from '../controllers/sites.mjs';
import { authReq } from '../controllers/auth.mjs';
import { addComment } from '../controllers/comments.mjs';


const siteRouter = express();
siteRouter.set('views', path.resolve('src/views'));

// Site routes
siteRouter.get('/', GetSite);
siteRouter.get('/sites', getSitesApi);
siteRouter.get('/:id', GetSiteById);
siteRouter.post('/:id/like', authReq, toggleLike);

// Comment routes
siteRouter.post('/:id/comment', authReq, addComment);

export { siteRouter };
