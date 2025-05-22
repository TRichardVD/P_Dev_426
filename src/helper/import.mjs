import Site from '../models/site.mjs';
import fs from 'fs';
import path from 'path';

export const importData = async () => {
    const filePath = path.resolve('resources/world-heritage-list.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const heritageSites = JSON.parse(data);
    heritageSites.forEach((site) => {
        const countries = site.states
            ? site.states.split(',').map((country) => country.trim())
            : [];
        const longitude =
            site.longitude && site.longitude !== ''
                ? Number(site.longitude)
                : 0;
        const latitude =
            site.latitude && site.latitude !== '' ? Number(site.latitude) : 0;
        const newSite = new Site({
            name: site.site,
            address: site.location,
            description: site.short_description,
            country: countries,
            category: site.category || undefined,
            coordinates: {
                type: 'Point',
                coordinates: [longitude, latitude],
            },
        });
        newSite.save().catch((error) => {
            console.error("Erreur lors de l'importation du site :", error);
        });
    });
};
