import express from 'express';
import path from 'path';
import { GetSite, GetSiteById } from '../controllers/sites.mjs';
import { authReq } from '../controllers/auth.mjs';

const siteRouter = express();
siteRouter.set('views', path.resolve('src/views'));
siteRouter.get('/', authReq, GetSite);

siteRouter.get('/:id', GetSiteById);

export { siteRouter };
