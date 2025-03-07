import mongoose from 'mongoose';
import Site from '../models/site.mjs';
import fs from 'fs';
import path from 'path';

export const importData = async () => {
    const filePath = path.resolve('resources/world-heritage-list.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const heritageSites = JSON.parse(data);
    heritageSites.forEach((site) => {
        const newSite = new Site({
            name: site.site,
            address: site.location,
            description: site.short_description,
            country: site.states,
            coordinates: {
                lat: site.coordinates.lat,
                lon: site.coordinates.lon,
            },
        });
        newSite.save();
    });
};
