// routes/search.js
const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// Endpoint pentru căutarea produselor în baza de date pe baza unui șir de interogare
router.get("/products", async (req, res) => {
  const { query } = req.query;

  try {
    // Căutăm produsele care conțin șirul de interogare în nume sau descriere
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Căutare case-insensitive în nume
        { description: { $regex: query, $options: "i" } }, // Căutare case-insensitive în descriere
      ],
    });

    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router;
