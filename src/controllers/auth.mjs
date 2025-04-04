import bcrypt from "bcrypt";
import User from "../models/user.mjs";
import { createToken, verifyToken } from "../helper/jwt.mjs";
import { randomBytes } from "crypto";

//register
async function Register(req, res) {
  const { username, email, password, confirmPassword } = req.body;
  let errors = {};
  if (!username || !email || !password || !confirmPassword) {
    return res.redirect(
      `/register?err=${encodeURIComponent(
        "Tous les champs doivent être spécifiés"
      )}`
    );
  } else {
    try {
      const emailExist = await User.findOne({ email });
      if (emailExist) {
        errors.email = {
          message: "L'email est déjà utilisé, essayez un autre.",
          value: email,
        };
      }
      const usernameExist = await User.findOne({ username });
      if (usernameExist) {
        errors.username = {
          message: "L'username est déjà utilisé, essayez un autre.",
          value: username,
        };
      }
      if (password.length < 8) {
        errors.password = {
          message: "Le mot de passe doit contenir au moins 8 caractères.",
          value: password,
        };
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = {
          message: "Les mots de passe ne correspondent pas.",
          value: confirmPassword,
        };
      }
      if (Object.keys(errors).length === 0) {
        const hashedPassword = await bcrypt.hash(password, 15);
        const user = new User({
          username: username,
          password: hashedPassword,
          email: email,
        });
        await user.save();
        return res.redirect(
          `/login?success=${encodeURIComponent(
            "Le compte a été crée avec succès"
          )}`
        );
      }

      // Rafficher la page avec les erreurs
      return res.render("auth/register", { errors });
    } catch (err) {
      console.error(err);
      if (err.errors) {
        for (const key in err.errors) {
          errors[key] = {
            message: err.errors[key].message,
            value: req.body[key],
          };
        }
        console.error(errors);
        return res.render("register", { errors });
      }
      return res.redirect(
        `/register?err=${encodeURIComponent("Une erreur est survenue")}`
      );
    }
  }
}

//login
async function Login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.redirect(
      `/login?err=${encodeURIComponent(
        "Tous les champs doivent être spécifiés"
      )}`
    );
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.redirect(
        `/login?err=${encodeURIComponent(
          "L'username ou le mot de passe est incorrect."
        )}`
      );
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.redirect(
        `/login?err=${encodeURIComponent(
          "L'username ou le mot de passe est incorrect."
        )}`
      );
    }
    const tokenId = randomBytes(16).toString("hex");
    user.sessions.push(tokenId);
    await user.save();
    const token = await createToken({
      username: user.username,
      jti: tokenId,
      sub: user._id,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.redirect(
      `/?success=${encodeURIComponent("Connexion réussie.")}`
    );
  } catch (err) {
    console.error(err);
    return res.redirect(
      `/login?err=${encodeURIComponent("Erreur interne du serveur")}`
    );
  }
}

const Logout = async (req, res) => {
  if (!req.user.session_id) {
    return res.redirect(`/login?err=${encodeURIComponent("Non autorisé")}`);
  }
  try {
    const decoded = await verifyToken(req.cookies.token);
    const user = await User.findOne({ _id: decoded.sub });
    if (!user) {
      return res.redirect(`/login?err=${encodeURIComponent("Non autorisé")}`);
    }
    user.sessions = user.sessions.filter((session) => session !== decoded.jti);
    await user.save();
    res.clearCookie("token");
    return res.redirect(
      `/login?success=${encodeURIComponent("Déconnexion réussie")}`
    );
  } catch (err) {
    console.error(err);
    return res.redirect(
      `/login?err=${encodeURIComponent("Erreur interne du serveur")}`
    );
  }
};

const authReq = async (req, res, next) => {
  let token = req.cookies.token;
  if (!token) {
    const authHeader = req.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }
  if (!token) {
    return res.redirect(`/login?err=${encodeURIComponent("Non autorisé")}`);
  }
  try {
    const decoded = await verifyToken(token);
    const user = await User.findOne({ _id: decoded.sub });
    if (!user || !user.sessions || !user.sessions.includes(decoded.jti)) {
      return res.redirect(`/login?err=${encodeURIComponent("Non autorisé")}`);
    }
    req.user = {
      username: user.username,
      id: user._id,
      session_id: decoded.jti,
    };
    next();
  } catch (err) {
    console.error(err);
    return res.redirect(`/login?err=${encodeURIComponent("Non autorisé")}`);
  }
};

export { Register, Login, authReq, Logout };
