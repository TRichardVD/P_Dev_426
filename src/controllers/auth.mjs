import bcrypt from 'bcrypt';
import User from '../models/user.mjs';
import mongoose from 'mongoose';

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
      return res
        .status(400)
        .json({ message: "L'email est déjà utilisé, essayez un autre." });
    }
  });
  // Vérifier si le nom d'utilisateur existe déjà dans la base de données
  User.findOne({ username }).then((usernameExist) => {
    if (usernameExist) {
      return res.status(400).json({
        message: "Le nom d'utilisateur est déjà utilisé, essayez un autre.",
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
      user.save();
      return res.status(201).json({ message: 'Utilisateur créé avec succès.' });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    });
}

//login
async function Login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Tous les champs doivent être spécifiés' });
  }
  // Vérifier si l'utilisateur existe dans la base de données
  User.findOne({ email }).then((user) => {
    if (!user) {
      return res
        .status(400)
        .json({ message: "L'email ou le mot de passe est incorrect." });
    }
    // Comparer le mot de passe
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "L'email ou le mot de passe est incorrect." });
      }
      return res.status(200).json({ message: 'Connexion réussie.' });
    });
  }).catch((err) => {
    console.error(err);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  });
}

export { Register, Login };
