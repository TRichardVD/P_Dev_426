import Site from '../models/site.mjs';
import mongoose from 'mongoose';
async function GetSite(req, res) {
  const { query } = req.query;
  if (!query) {
    Site.find()
      .limit(20)
      .then((sites) => {
        return res.render('search', { results: sites, query: null });
      });
  } else {
    Site.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { country: { $regex: query, $options: 'i' } },
      ],
    })
      .then((sites) => {
        return res.render('search', { results: sites, query });
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
    //const site = await findByCustomId(id);
    const site = {
      comments :[],
      "category": "Natural",
      "criteria_txt": "(ix)",
      "danger": null,
      "date_inscribed": "2007",
      "extension": 1,
      "http_url": null,
      "id_number": 1133,
      "image_url": {
          "thumbnail": true,
          "filename": "site_1133.jpg",
          "format": "JPEG",
          "width": 80,
          "mimetype": "image/jpeg",
          "etag": "\"1c8f28ba5ffd21:0\"",
          "id": "84aefa7c9c4b15d30c41c14dc0c88ce4",
          "last_synchronized": "2021-02-17T13:06:47.879845",
          "color_summary": [
              "rgba(148, 139, 127, 1.00)",
              "rgba(83, 81, 76, 1.00)",
              "rgba(69, 67, 67, 1.00)"
          ],
          "height": 80
      },
      "iso_code": "al,at,be,bg,hr,de,it,ro,sk,si,es,ua",
      "justification": null,
      "location": null,
      "region": "Europe and North America",
      "revision": 0,
      "secondary_dates": "2011",
      "short_description": "This transboundary property stretches over 12 countries. Since the end of the last Ice Age, European Beech spread from a few isolated refuge areas in the Alps, Carpathians, Dinarides, Mediterranean and Pyrenees over a short period of a few thousand years in a process that is still ongoing. The successful expansion across a whole continent is related to the tree\u2019s adaptability and tolerance of different climatic, geographical and physical conditions.",
      "site": "Ancient and Primeval Beech Forests of the Carpathians and Other Regions of Europe",
      "states": [
          "Albania",
          "Austria",
          "Belgium",
          "Bulgaria",
          "Croatia",
          "Germany",
          "Italy",
          "Romania",
          "Slovakia",
          "Slovenia",
          "Spain",
          "Ukraine"
      ],
      "transboundary": 1,
      "coordinates": { "lon": 22.3388888889, "lat": 49.0097222222 }
  }
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    console.log(site);
    return res.render('detailed-view', {site});
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
