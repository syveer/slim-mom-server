const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");

// Endpoint public pentru obținerea aportului zilnic de kcal și a listei de produse nerecomandate
router.get("/daily-intake", async (req, res) => {
  try {
    // Implementarea logică pentru obținerea aportului zilnic și a listei de produse nerecomandate
    // Poți adapta această parte în funcție de logica ta de afișare a datelor publice
    res.status(200).send({ message: "Public endpoint for daily intake" });
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router;
