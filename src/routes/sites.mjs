import express from 'express';
import path from 'path';
import { GetSite, GetSiteById } from '../controllers/sites.mjs';

const siteRouter = express();
siteRouter.set('views', path.resolve('src/views'));
siteRouter.get('/', GetSite);

siteRouter.get('/:id', GetSiteById);

export { siteRouter };
