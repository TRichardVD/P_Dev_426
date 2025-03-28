import Site from '../models/site.mjs';

async function GetSite(req, res) {
  const { query, country, sortField, sortOrder, lat, lon } = req.query;

  // Préparation du pipeline d'agrégation
  const pipeline = [];

  // Gérer d'abord la requête géospatiale si nécessaire (doit être la première étape du pipeline)
  if (sortField === 'proximite' && lat && lon) {
    pipeline.push({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(lon), parseFloat(lat)], // Longitude, Latitude
        },
        distanceField: 'distance',
        spherical: true,
        query: {}, // On ajoutera d'autres conditions ici si nécessaire
      },
    });
  }

  // Construction des conditions de correspondance
  const matchConditions = {};

  // Ajouter le filtre de pays si fourni
  if (country) {
    matchConditions.country = { $in: [country] };
  }

  // Ajouter la recherche textuelle si fournie
  if (query) {
    matchConditions.$text = { $search: query };
  }

  // Ajouter l'étape de correspondance si nous avons des conditions
  if (Object.keys(matchConditions).length > 0) {
    // Si nous avons déjà $geoNear, ajouter ces conditions à sa requête
    if (pipeline.some((stage) => stage.$geoNear)) {
      pipeline[0].$geoNear.query = matchConditions;
    } else {
      pipeline.push({ $match: matchConditions });
    }
  }

  // Si recherche textuelle, ajouter le champ de score
  if (query) {
    pipeline.push({
      $addFields: {
        score: { $meta: 'textScore' },
      },
    });
  }

  // Ajouter l'étape de tri
  let needsSortStage = true;
  if (sortField === 'proximite' && pipeline.some((stage) => stage.$geoNear)) {
    // Si on utilise $geoNear pour la proximité, les résultats sont déjà triés par distance
    needsSortStage = false;
  }

  if (needsSortStage) {
    const sortStage = { $sort: {} };

    if (sortField) {
      switch (sortField) {
        case 'date':
          sortStage.$sort.date = sortOrder === 'asc' ? 1 : -1;
          break;
        case 'pertinence':
          sortStage.$sort.likes_count = sortOrder === 'asc' ? 1 : -1;
          break;
        case 'proximite':
          // Gérer le cas où la proximité est demandée mais lat/lon n'ont pas été fournis
          sortStage.$sort.coordinates = 1;
          break;
      }
    } else if (query) {
      // Si pas de sortField mais recherche textuelle, trier par score
      sortStage.$sort.score = -1; // Score plus élevé = plus pertinent
    }

    // Ajouter l'étape de tri seulement si nous avons des critères de tri
    if (Object.keys(sortStage.$sort).length > 0) {
      pipeline.push(sortStage);
    }
  }

  // Ajouter l'étape de limite
  pipeline.push({ $limit: 20 });

  try {
    // Exécution du pipeline d'agrégation
    const sites = await Site.aggregate(pipeline);

    // Rendu des résultats
    return res.render('search', {
      results: sites,
      query: query || null,
      country: country || null,
      sortField: sortField || null,
      sortOrder: sortOrder || null,
    });
  } catch (err) {
    // Gestion des erreurs
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
