import Site from '../models/site.mjs';

async function GetSite(req, res) {
  const { query } = req.query;
  if (!query) {
    Site.find()
      .limit(20)
      .then((sites) => {
        return res.render('search', { results: sites, query: null });
      });
  } else {
    Site.find(
      {
        $or: [{ $text: { $search: query } }],
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
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

    const customId = `${coordinates.lat}_${coordinates.lon}`.replace(
      /\./g,
      '_'
    );
    return Buffer.from(customId).toString('base64'); // encode to base64
  } catch (error) {
    console.error('Error calculating custom ID:', error);
    throw error;
  }
}

async function findByCustomId(customId) {
  try {
    const decodedId = Buffer.from(customId, 'base64').toString('ascii'); // decode from base64
    const splitId = decodedId.split('_');
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
