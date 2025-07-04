import mongoose from "mongoose";
import { importData } from "../helper/import.mjs";
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
  try {
    const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${
      process.env.DB_HOST || "localhost"
    }:${process.env.DB_PORT || 27017}/db_unesco?authSource=admin`;

    console.log("Tentative de connexion à MongoDB... via uri :", uri);
    await mongoose.connect(uri, {});
    // Force la syncronisation donc suppression de la base de données et recréation
    // await mongoose.connection.db.dropDatabase();
    // await mongoose.connection.db.createCollection("sites");

    // importData(); // Décommentez pour importer les données avec la catégorie
    // importList();
    console.log("Connexion réussie à MongoDB");
  } catch (error) {
    console.error("Erreur de connexion :", error);
    process.exit(1); // Quitte le processus si la connexion échoue
  }
};

export default connectDB;
