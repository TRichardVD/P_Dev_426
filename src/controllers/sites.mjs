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

async function GetSiteById(req, res) {
  const { id } = req.params;
  const idPattern = /^-?\d+_\d+_-?\d+_\d+$/;
  if (!idPattern.test(id)) {
    return res.status(400).json({
      error: 'Invalid site ID format. Expected format: lat_dec_lon_dec',
    });
  }

  try {
    const site = await findByCustomId(id);
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    console.log(site);
    return res.status(200).json(site);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
}

async function calculateCustomId(id) {
  try {
    const site = await Site.findById(id).exec();

    if (!site) {
      return null;
    }

    const { coordinates } = site;
    if (!coordinates || !coordinates.lat || !coordinates.lon) {
      return null;
    }

    return `${coordinates.lat}_${coordinates.lon}`.replace(/\./g, '_'); // replace . with _
  } catch (error) {
    console.error('Error calculating custom ID:', error);
    throw error;
  }
}

async function findByCustomId(customId) {
  try {
    const splitId = customId.split('_');
    const coordinates = {
      lat: Number(`${splitId[0]}.${splitId[1]}`),
      lon: Number(`${splitId[2]}.${splitId[3]}`),
    };
    console.log(coordinates);

    const site = await Site.findOne({
      'coordinates.lat': coordinates.lat,
      'coordinates.lon': coordinates.lon,
    });
    return site;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export { GetSite, GetSiteById, calculateCustomId, findByCustomId };
