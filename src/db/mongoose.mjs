import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/db_unesco', {});
    console.log('Connexion réussie à MongoDB');
  } catch (error) {
    console.error('Erreur de connexion :', error);
    process.exit(1); // Quitte le processus si la connexion échoue
  }
};

export default connectDB;
