import mongoose from 'mongoose';
import Site from '../models/site.mjs';
import fs from 'fs';
import path from 'path';

export const importData = async () => {
  const filePath = path.resolve('resources/world-heritage-list.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  const heritageSites = JSON.parse(data);
  heritageSites.forEach((site) => {
    const countries = site.states.split(',').map((country) => country.trim());
    const newSite = new Site({
      name: site.site,
      address: site.location,
      description: site.short_description,
      country: countries,
      'coordinates.coordinates':
        site.longitude != '' && site.latitude != ''
          ? [site.longitude, site.latitude]
          : [0, 0],
    });
    newSite.save();
  });
};
