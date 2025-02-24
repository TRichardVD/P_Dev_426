import bcrypt from 'bcrypt';
import User from '../models/user.mjs';
import mongoose from 'mongoose';
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

export { Register };
