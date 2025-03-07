import express from 'express';
import { GetSite, GetSiteById } from '../controllers/sites.mjs';
const siteRouter = express();

siteRouter.get('/', GetSite);

siteRouter.get('/:id', GetSiteById);

export { siteRouter };
