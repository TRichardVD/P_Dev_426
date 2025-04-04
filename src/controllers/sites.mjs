import Site from '../models/site.mjs';

async function GetSite(req, res) {
  const { query, country, sortField, sortOrder } = req.query;
  let mongoSort = {};
  const filter = {};

  if (country) {
    filter.country = { $in: [country] };
  }

  const projection = {};
  if (query) {
    filter.$text = { $search: query, $language: 'french' };
    projection.score = { $meta: 'textScore' };

    mongoSort = { score: { $meta: 'textScore' } };
  }

  console.log('MongoDB sort:', mongoSort);

  try {
    const sites = await Site.find(filter, projection).sort(mongoSort).limit(20);

    if (sortField) {
      switch (sortField) {
        case 'pertinence':
          sites.sort((a, b) => {
            return sortOrder === 'asc'
              ? a.likes_count - b.likes_count
              : b.likes_count - a.likes_count;
          });
          break;
        case 'alphabetique':
          sites.sort((a, b) => {
            if (sortOrder === 'asc') {
              return a.name.localeCompare(b.name);
            } else {
              return b.name.localeCompare(a.name);
            }
          });
          break;
      }
    }

    return res.render('search', {
      results: sites,
      query: query || null,
      country: country || null,
      sortField: sortField || null,
      sortOrder: sortOrder || null,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
    return customId;
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
