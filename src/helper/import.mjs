import Site from "../models/site.mjs";
import Comment from "../models/comment.mjs";
import fs from "fs";
import path from "path";
import User from "../models/user.mjs";
import List from "../models/list.mjs";

export const importData = async () => {
  const filePath = path.resolve("resources/world-heritage-list.json");
  const data = fs.readFileSync(filePath, "utf-8");
  const heritageSites = JSON.parse(data);
  heritageSites.forEach((site) => {
    const countries = site.states.split(",").map((country) => country.trim());
    const newSite = new Site({
      name: site.site,
      address: site.location,
      description: site.short_description,
      country: countries,
      "coordinates.coordinates":
        site.longitude != "" && site.latitude != ""
          ? [site.longitude, site.latitude]
          : [0, 0],
    });
    newSite.save().catch((error) => {
      console.error("Erreur lors de l'importation du site :", error);
    });
  });
};
export const importList = async () => {
  const user = new User({
    username: "popo",
    password: "pepepepe",
    email: "popo@pepe.com",
  });
  await user.save().catch((error) => {
    console.error("erreur lors de l'importation de l'utilisateur", error);
  });
  const list = new List({
    name: "pppp",
    color: "#cccccc",
    user: user?.id,
  });
  await list.save().catch((error) => {
    console.error("erreur lors de l'importation de la liste", error);
  });
};
