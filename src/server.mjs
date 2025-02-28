import https from 'https';
import express from 'express';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import connectDB from './db/mongoose.mjs';
import { siteRouter } from './routes/sites.mjs';
const app = express();

// middlewares principaux
app.use(express.json());
app.use(cookieParser());
app.use(express.static('./resources'));

app.set('view engine', 'ejs'); // Utilisation du moteur de rendu EJS
app.set('views', path.resolve('src/views')); // Définition du dossier des vues

const credentials = {
  key: fs.readFileSync('./certificates/server.key'), // Clé privée
  cert: fs.readFileSync('./certificates/server.crt'), // Certificat public
};

// Routes principales
app.get('/', (req, res) => {
  res.render('index');
});

app.use('/api/user', siteRouter);
// Démarrage du serveur
https.createServer(credentials, app).listen(443, () => {
  connectDB();
  console.log('Server running on port 443 https://localhost:443');
});
