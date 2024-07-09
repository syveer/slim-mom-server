// routes/protected.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");
const Session = require("../models/Session");

const router = express.Router();

// Middleware pentru verificarea token-ului de acces
const verifyAccessToken = async (req, res, next) => {
  const accessToken = req.headers.authorization;

  if (!accessToken) {
    return res.status(401).send({ error: "Access token required" });
  }

  try {
    // Verificăm și decodăm token-ul de acces
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;

    // Verificăm dacă sesiunea asociată token-ului de acces există și este validă
    const session = await Session.findOne({
      userId: req.userId,
      refreshToken: req.headers.refresh,
    });
    if (!session) {
      return res.status(401).send({ error: "Invalid session" });
    }

    next();
  } catch (error) {
    return res.status(401).send({ error: "Invalid token" });
  }
};

// Endpoint pentru adăugarea unui produs consumat într-o anumită zi
router.post("/add-consumed-product", verifyAccessToken, async (req, res) => {
  const { productId, date } = req.body;

  try {
    // Verificăm dacă productId există în baza de date
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    // Adăugăm produsul consumat în lista pentru ziua specificată
    const user = await User.findById(req.userId);
    const consumedProduct = {
      product: {
        name: product.name,
        calories: product.calories,
        recommended: product.recommended,
      },
      date,
    };
    user.dailyIntake.push(consumedProduct);
    await user.save();

    res.status(200).send({ message: "Product added successfully" });
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Endpoint pentru ștergerea unui produs consumat într-o anumită zi
router.delete(
  "/delete-consumed-product",
  verifyAccessToken,
  async (req, res) => {
    const { productId, date } = req.body;

    try {
      // Ștergem produsul consumat din lista pentru ziua specificată
      const user = await User.findById(req.userId);
      user.dailyIntake = user.dailyIntake.filter(
        (item) =>
          !(item.product._id.toString() === productId && item.date === date)
      );
      await user.save();

      res.status(200).send({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).send({ error: "Internal server error" });
    }
  }
);

// Endpoint pentru obținerea tuturor informațiilor pentru o zi specifică
router.get("/day-info", verifyAccessToken, async (req, res) => {
  const { date } = req.query;

  try {
    // Căutăm informațiile pentru ziua specificată în lista de produse consumate
    const user = await User.findById(req.userId);
    const dayInfo = user.dailyIntake.filter((item) => item.date === date);

    res.status(200).send(dayInfo);
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router;
