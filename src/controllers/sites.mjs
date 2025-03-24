import Site from '../models/site.mjs';

async function GetSite(req, res) {
  const { query, country } = req.query;

  // Construction de la requête
  const searchConditions = {};

  // Si un pays est défini, on ajoute un filtre sur le pays
  if (country) {
    searchConditions.country = { $in: [country] };
  }

  // Si une query de texte est définie, on l'ajoute
  if (query) {
    searchConditions.$text = { $search: query };
  }

  // Ajout de la limite pour éviter trop de résultats
  const limit = 20;

  try {
    // Exécution de la requête avec ou sans filtre de texte, et avec ou sans pays
    const sites = await Site.find(searchConditions)
      .limit(limit)
      .sort(query ? { score: { $meta: 'textScore' } } : {}); // Si query, on trie par score, sinon pas de tri particulier

    return res.render('search', {
      results: sites,
      query: query || null,
      country: country || null,
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
