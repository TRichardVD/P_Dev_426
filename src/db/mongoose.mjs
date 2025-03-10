import mongoose from 'mongoose';
import { importData } from '../helper/import.mjs';
const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb://root:admin@localhost:27017/db_unesco?authSource=admin',
      {}
    );
    //importData();
    console.log('Connexion réussie à MongoDB');
  } catch (error) {
    console.error('Erreur de connexion :', error);
    process.exit(1); // Quitte le processus si la connexion échoue
  }
};

export default connectDB;
