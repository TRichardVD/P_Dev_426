import express from "express";
import cookieParser from "cookie-parser";
import https from "https";
const app = express();

// middlewares principaux
app.use(express.json());
app.use(cookieParser());
app.use(express.static("resources"));

// Routes principales
app.get("/", (req, res) => {
  res.render("index.html");
});

// Démarrage du serveur
https.createServer(app).listen(443, () => {
  console.log("Server running on port 443");
});
