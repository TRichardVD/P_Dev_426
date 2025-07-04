import { config } from 'dotenv';
config(); // Chargement des variables d'environnement depuis le fichier .env
import https from 'https';
import express from 'express';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import connectDB from './db/mongoose.mjs';
import { userRouter } from './routes/user.mjs';
import { siteRouter } from './routes/sites.mjs';
import { Register, Login, Logout } from './controllers/auth.mjs';
import { authReq, auth } from './controllers/auth.mjs';
import { toggleLike, toggleDislike } from './controllers/comments.mjs';
import { importData } from './helper/import.mjs';

const app = express();

//⚠⚠⚠⚠⚠⚠⚠⚠⚠> ELEVER LE COMMENTAIRE 1 FOIS <⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠
//importdata()
//⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠

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

app.use(auth); // Middleware d'authentification pour toutes les routes

// Routes d'affichages des pages d'accueil et de connexion

app.get('/', (req, res) => {
    res.render('index', {
        isLoggedIn: req.isLoggedIn,
        user: req.user,
    });
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
app.get('/create-list', authReq, (req, res) => {
    res.render('create-list');
});

// Routes API de l'utilisateur et des sites
app.use('/user', userRouter);
app.use('/site', siteRouter);

// Démarrage du serveur
https
    .createServer(credentials, app)
    .listen(process.env.PORT || 443, process.env.HOST || 'localhost', () => {
        connectDB();
        console.log('Server running on port 443 https://localhost:443');
    });
