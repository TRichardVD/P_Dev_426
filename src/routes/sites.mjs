import express from 'express';
import { GetSite } from '../controllers/sites.mjs';
const siteRouter = express();

siteRouter.get('/', GetSite);

export { siteRouter };
