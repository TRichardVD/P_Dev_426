import https from 'https';
import express from 'express';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import connectDB from './db/mongoose.mjs';
import { userRouter } from './routes/user.mjs';
import { siteRouter } from './routes/sites.mjs';
import { Register, Login, Logout } from './controllers/auth.mjs';
import { authReq } from './controllers/auth.mjs';
import { toggleLike, toggleDislike } from './controllers/comments.mjs';

const app = express();

// middlewares principaux
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('./resources'));

app.set('view engine', 'ejs'); // Utilisation du moteur de rendu EJS
app.set('views', path.resolve('./src/views')); // Définition du dossier des vues

const credentials = {
  key: fs.readFileSync('./certificates/server.key'), // Clé privée
  cert: fs.readFileSync('./certificates/server.crt'), // Certificat public
};

// Routes d'affichages des pages d'accueil et de connexion
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  return res.render('auth/register', {
    errors: {},
  });
});
app.get('/login', (req, res) => {
  return res.render('auth/login');
});

// Routes API de l'authentification
app.post('/register', Register);
app.post('/login', Login);
app.post('/logout', authReq, Logout);

// Like/Dislike routes
app.post('/api/comment/:id/like', authReq, toggleLike);
app.post('/api/comment/:id/dislike', authReq, toggleDislike);

// Routes API de l'utilisateur et des sites
app.use('/api/user', userRouter);
app.use('/api/site', siteRouter);

// Démarrage du serveur
https.createServer(credentials, app).listen(process.env.PORT || 443, () => {
  connectDB();
  console.log('Server running on port 443 https://localhost:443');
});
