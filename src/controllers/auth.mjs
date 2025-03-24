import bcrypt from 'bcrypt';
import User from '../models/user.mjs';
import { createToken, verifyToken } from '../helper/jwt.mjs';

//register
async function Register(req, res) {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res
            .status(400)
            .json({ message: 'Tous les champs doivent être spécifiés' });
    }
    // Vérifier si l'email existe déjà dans la base de données
    User.findOne({ email }).then((emailExist) => {
        if (emailExist) {
            return res.status(400).json({
                message: "L'email est déjà utilisé, essayez un autre.",
            });
        }
    });
    // Vérifier si le nom d'utilisateur existe déjà dans la base de données
    User.findOne({ username }).then((usernameExist) => {
        if (usernameExist) {
            return res.status(400).json({
                message:
                    "Le nom d'utilisateur est déjà utilisé, essayez un autre.",
            });
        }
    });
    bcrypt
        .hash(password, 15)
        .then((hashedPassword) => {
            const user = new User({
                username: username,
                password: hashedPassword,
                email: email,
            });
            user.save()
                .then((user) => {
                    return res
                        .status(201)
                        .json({ message: 'Utilisateur créé avec succès.' });
                })
                .catch((err) => {
                    if (typeof err === ValidationError) {
                        return res
                            .status(400)
                            .json({ message: 'Champ mal formaté' });
                    }
                    console.log(err);
                    return res.status(500).json({
                        message: 'Une erreur est survenue',
                    });
                });
        })
        .catch((err) => {
            console.error(err);
            return res
                .status(500)
                .json({ message: 'Erreur interne du serveur' });
        });
}

//login
async function Login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res
            .status(400)
            .json({ message: 'Tous les champs doivent être spécifiés' });
    }
    // Vérifier si l'utilisateur existe dans la base de données
    User.findOne({ username })
        .then((user) => {
            if (!user) {
                return res.status(400).json({
                    message: "L'username ou le mot de passe est incorrect.",
                });
            }
            // Comparer le mot de passe
            bcrypt.compare(password, user.password).then((isMatch) => {
                console.log(isMatch);
                if (!isMatch) {
                    return res.status(400).json({
                        message: "L'username ou le mot de passe est incorrect.",
                    });
                }

                // Création du token JWT
                createToken({ username: user.username })
                    .then((token) => {
                        return res
                            .status(200)
                            .cookie('token', token, {
                                httpOnly: true,
                                secure: true,
                                sameSite: 'none',
                            })
                            .json({ message: 'Connexion réussie.' });
                    })
                    .catch((err) => {
                        console.error(err);
                        return res
                            .status(500)
                            .json({ message: 'Erreur interne du serveur' });
                    });
            });
        })
        .catch((err) => {
            console.error(err);
            return res
                .status(500)
                .json({ message: 'Erreur interne du serveur' });
        });
}

const authReq = async (req, res, next) => {
    const token = req.cookies.token || req.header.Authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Non autorisé' });
    }
    verifyToken(token)
        .then((decoded) => {
            req.user = decoded;
            next();
        })
        .catch((err) => {
            console.error(err);
            return res.status(401).json({ message: 'Non autorisé' });
        });
};

export { Register, Login, authReq };
