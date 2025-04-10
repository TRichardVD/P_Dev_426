import Site from "../models/site.mjs";
import Comment from "../models/comment.mjs";
import fs from "fs";
import path from "path";

export const importData = async () => {
    const filePath = path.resolve("resources/world-heritage-list.json");
    const data = fs.readFileSync(filePath, "utf-8");
    const heritageSites = JSON.parse(data);
    heritageSites.forEach((site) => {
        const newSite = new Site({
            name: site.site,
            address: site.location,
            description: site.short_description,
            country: site.states,
            coordinates: {
                lat: site.latitude,
                lon: site.longitude,
            },
        });
        newSite.save();
    });
};
