import Site from '../models/site.mjs';
import { getImagesBySite } from '../services/unsplash.mjs';

const GetPhotosBySiteId = async (req, res) => {
    try {
        const siteId = req.params.id;
        if (!siteId) {
            return res.status(400).json({ error: 'Site ID is required' });
        }
        const site = await Site.find({ _id: siteId });
        if (!site || site.length === 0) {
            return res.status(404).json({ error: 'Site not found' });
        }

        const data = await getImagesBySite(site[0]);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export { GetPhotosBySiteId };
