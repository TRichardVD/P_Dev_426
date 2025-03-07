import Site from '../models/site.mjs';
import mongoose from 'mongoose';
async function GetSite(req, res) {
  const { query } = req.query;
  if (!query) {
    Site.find()
      .limit(20)
      .then((sites) => {
        return res.status(200).json(sites);
      });
  } else {
    Site.find()
      .or([
        { name: { $regex: query, $options: 'i' } },
        { country: { $regex: query, $options: 'i' } },
      ])
      .then((sites) => {
        return res.status(200).json(sites);
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
  }
}
export { GetSite };
