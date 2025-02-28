import express from 'express';
const siteRouter = express();

siteRouter.get('/site', (req, res) => {
  res.send('Liste des sites');
});

export { siteRouter };
