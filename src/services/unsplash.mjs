import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const accessKey = encodeURIComponent(process.env.UNSPLASH_ACCESS_KEY);

const BASE_URL = 'https://api.unsplash.com';

// Get images from unsplash by searhing of site
const getImagesBySite = async (site) => {
    if (!site) {
        throw new Error('Site is required');
    }

    const siteName = site.name
        .toLowerCase()
        .split(',')[0]
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim();
    console.log('siteName', siteName);

    const keywords = [siteName].filter(Boolean).join(' ');

    const query = encodeURIComponent(keywords);

    const url = `${BASE_URL}/search/photos?query=${query}&client_id=${accessKey}&per_page=10&lang=fr`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(query);
    if (!response.ok) {
        throw new Error(`Error fetching images: ${data.errors}`);
    }
    if (!data.results || data.results.length === 0) {
        throw new Error('No images found');
    }
    const images = data.results.map((image) => ({
        id: image.id,
        description: image.description || image.alt_description,
        urls: {
            small: image.urls.small,
            regular: image.urls.regular,
            full: image.urls.full,
        },
        links: {
            html: image.links.html,
        },
        user: {
            name: image.user.name,
            profile_image: image.user.profile_image.small,
            portfolio_url: image.user.portfolio_url,
            links: {
                html: image.user.links.html,
                photos: image.user.links.photos,
            },
        },
    }));
    return images;
};

export { getImagesBySite };
