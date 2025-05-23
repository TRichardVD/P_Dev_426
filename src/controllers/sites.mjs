import Site from '../models/site.mjs';
import User from '../models/user.mjs';
import { getCommentsBySiteIdInsecure } from './comments.mjs';

const cleanUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    lists: user.lists.map((list) => ({
      id: list._id,
      name: list.name,
      color: list.color,
    })),
  };
};

async function GetSite(req, res) {
  const { query, country, sortField, sortOrder } = req.query;
  let mongoSort = {};
  const filter = {};

  if (country) {
    filter.country = { $regex: new RegExp(`^${country}$`, 'i') };
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
              ? a.likes.length - b.likes.length
              : b.likes.length - a.likes.length;
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
    let userData = null;
    if (req.isLoggedIn && req.user && req.user.id) {
      userData = cleanUser(await User.findById(req.user.id).populate('lists'));
    }

    const filteredSites = sites.map((site) => ({
      _id: site._id,
      name: site.name,
      description: site.description,
      coordinates: site.coordinates,
      images: site.images,
      likes: site.likes.length,
      category: site.category,
    }));

    return res.render('search', {
      isLoggedIn: req.isLoggedIn,
      results: filteredSites,
      query: query || null,
      country: country || null,
      sortField: sortField || null,
      sortOrder: sortOrder || null,
      user: userData,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getSitesApi(req, res) {
  try {
    const sites = await Site.find();

    const result = sites.map((site) => ({
      id: site._id,
      name: site.name,
      description: site.description,
      coordinates: site.coordinates,
      images: site.images,
      likes: site.likes.length,
      category: site.category,
    }));

    return res.json(result);
  } catch (err) {
    console.error('Error fetching sites:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function GetSiteById(req, res) {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null;
  if (!id) {
    return res.status(400).json({ error: 'Site ID is required' });
  }

  try {
    const site = await Site.findOne({ _id: id });
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    const comments = await getCommentsBySiteIdInsecure(id);
    const enhancedComments = comments.map((comment) => ({
      ...comment,
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
      userHasLiked: req.user ? comment.likes.includes(req.user.id) : false,
      userHasDisliked: req.user
        ? comment.dislikes.includes(req.user.id)
        : false,
    }));
    let userData = null;
    if (userId) {
      userData = cleanUser(await User.findById(userId).populate('lists'));
    }
    const result = {
      _id: site._id,
      name: site.name,
      description: site.description,
      coordinates: site.coordinates,
      comments: enhancedComments,
      likes: site.likes.length,
      category: site.category,
      user: userData ? userData : null,
    };
    console.log('Site details:', result);
    return res.render('detailed-view', {
      site: result,
      isLoggedIn: req.isLoggedIn,
      unsplashAppId: process.env.UNSPLASH_APP_ID,
    });
  } catch (err) {
    console.error('Error in GetSiteById:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function toggleLike(req, res) {
  if (!req.isLoggedIn) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    const likesCount = await site.toggleLike(req.user.id);
    site.save();
    return res.json({ likes: likesCount });
  } catch (err) {
    console.error('Error toggling site like:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export { GetSite, GetSiteById, toggleLike, getSitesApi };
