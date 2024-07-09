// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Session = require("../models/Session");

const router = express.Router();

// Endpoint pentru înregistrarea unui utilizator
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Verificăm dacă utilizatorul există deja în baza de date
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).send({ error: "Username already exists" });
    }

    // Creăm un nou utilizator
    user = new User({ username, password });
    await user.save();

    res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Endpoint pentru autentificarea utilizatorului
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Căutăm utilizatorul în baza de date
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send({ error: "Authentication failed" });
    }

    // Verificăm parola utilizatorului
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send({ error: "Authentication failed" });
    }

    // Generează token de acces și refresh token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Salvăm refresh token-ul într-o sesiune în baza de date
    const session = new Session({ userId: user._id, refreshToken });
    await session.save();

    res.status(200).send({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Endpoint pentru deconectarea utilizatorului (ștergerea sesiunii)
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).send({ error: "Refresh token required" });
  }

  try {
    // Șterge sesiunea din baza de date pe baza refreshToken-ului
    await Session.findOneAndDelete({ refreshToken });
    res.status(200).send({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Endpoint pentru reîmprospătarea token-urilor (accessToken și refreshToken)
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).send({ error: "Refresh token required" });
  }

  try {
    // Căutăm sesiunea în baza de date pe baza refreshToken-ului
    const session = await Session.findOne({ refreshToken });
    if (!session) {
      return res.status(401).send({ error: "Invalid refresh token" });
    }

    // Verificăm și decodăm accessToken-ul
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(401).send({ error: "Invalid refresh token" });
        }

        // Generăm un nou accessToken
        const accessToken = jwt.sign(
          { userId: decoded.userId },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );

        res.status(200).send({ accessToken });
      }
    );
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router;
