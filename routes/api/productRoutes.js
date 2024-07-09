const express = require("express");
const Product = require("../../models/Product");
const ConsumedProduct = require("../../models/ConsumedProduct");
const DailyIntake = require("../../models/DailyIntake");
const calculateCalories = require("../../utils/calculateCalories");
const {
  validateAuth,
  authorizeRoles,
} = require("../../middleware/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - categories
 *         - weight
 *         - title
 *         - calories
 *         - groupBloodNotAllowed
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the product
 *         categories:
 *           type: string
 *           description: The category of the product
 *         weight:
 *           type: number
 *           description: The weight of the product
 *         title:
 *           type: string
 *           description: The title of the product
 *         calories:
 *           type: number
 *           description: The calories of the product
 *         groupBloodNotAllowed:
 *           type: array
 *           items:
 *             type: boolean
 *           description: Group blood not allowed status
 *         __v:
 *           type: number
 *           description: Version key
 *       example:
 *         _id: d5fE_asz
 *         categories: cereals
 *         weight: 100
 *         title: Amaranth
 *         calories: 371
 *         groupBloodNotAllowed: [null, true, false, false, false]
 *         __v: 0
 *     ConsumedProduct:
 *       type: object
 *       required:
 *         - userId
 *         - productId
 *         - date
 *         - quantity
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the consumed product
 *         userId:
 *           type: string
 *           description: The id of the user
 *         productId:
 *           type: string
 *           description: The id of the product
 *         date:
 *           type: string
 *           format: date
 *           description: The date the product was consumed
 *         quantity:
 *           type: number
 *           description: The quantity of the consumed product
 *         __v:
 *           type: number
 *           description: Version key
 *       example:
 *         _id: d5fE_asz
 *         userId: 5f8f8c44b54764421b7156c3
 *         productId: 5d51694802b2373622ff5543
 *         date: 2023-07-01
 *         quantity: 100
 *         __v: 0
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API for products
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: The list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: The product was created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 */
router.post("/", validateAuth, authorizeRoles("admin"), async (req, res) => {
  const product = new Product({
    categories: req.body.categories,
    weight: req.body.weight,
    title: req.body.title,
    calories: req.body.calories,
    groupBloodNotAllowed: req.body.groupBloodNotAllowed,
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/products/daily-intake:
 *   get:
 *     summary: Get daily intake and list of not recommended products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: weight
 *         schema:
 *           type: number
 *         required: true
 *         description: Weight of the user
 *       - in: query
 *         name: height
 *         schema:
 *           type: number
 *         required: true
 *         description: Height of the user
 *       - in: query
 *         name: age
 *         schema:
 *           type: number
 *         required: true
 *         description: Age of the user
 *       - in: query
 *         name: groupBloodNotAllowed
 *         schema:
 *           type: boolean
 *         required: true
 *         description: Group blood not allowed status
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dailyKcal:
 *                   type: number
 *                 notRecommendedProducts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid parameters
 */
router.get("/daily-intake", async (req, res) => {
  try {
    const { weight, height, age, groupBloodNotAllowed } = req.query;

    const dailyKcal = calculateCalories(weight, height, age);
    if (dailyKcal === null) {
      return res
        .status(400)
        .json({ message: "Please provide valid weight, height, and age" });
    }

    const products = await Product.find({
      groupBloodNotAllowed: groupBloodNotAllowed === "true",
    });

    res.json({
      dailyKcal,
      notRecommendedProducts: products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/products/daily-intake:
 *   post:
 *     summary: Add daily intake and list of not recommended products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *               height:
 *                 type: number
 *               age:
 *                 type: number
 *               groupBloodNotAllowed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dailyKcal:
 *                   type: number
 *                 notRecommendedProducts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid parameters
 */
router.post("/daily-intake", validateAuth, async (req, res) => {
  try {
    const { weight, height, age, groupBloodNotAllowed } = req.body;
    const userId = req.user._id;

    const dailyKcal = calculateCalories(weight, height, age);
    if (dailyKcal === null) {
      return res
        .status(400)
        .json({ message: "Please provide valid weight, height, and age" });
    }

    const products = await Product.find({
      groupBloodNotAllowed: groupBloodNotAllowed === "true",
    });

    const notRecommendedProducts = products.map((product) => product.title);

    const dailyIntake = new DailyIntake({
      userId,
      weight,
      height,
      age,
      dailyKcal,
      notRecommendedProducts,
    });

    await dailyIntake.save();

    res.json({
      dailyKcal,
      notRecommendedProducts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Query string for searching products
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Query string is required
 */
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query string is required" });
    }

    // Căutare produse pe baza titlului sau categoriilor
    const products = await Product.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { categories: { $regex: query, $options: "i" } },
      ],
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/products/consumed:
 *   post:
 *     summary: Add a consumed product for a specific day
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Successfully added consumed product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsumedProduct'
 *       500:
 *         description: Server error
 */
router.post("/consumed", validateAuth, async (req, res) => {
  try {
    const { productId, date, quantity } = req.body;
    const userId = req.user._id;

    // Verificăm dacă produsul există
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const consumedProduct = new ConsumedProduct({
      userId,
      productId,
      date: new Date(date),
      quantity,
    });

    await consumedProduct.save();

    res.status(201).json(consumedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/products/consumed/{id}:
 *   delete:
 *     summary: Delete a consumed product for a specific day
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the consumed product to delete
 *     responses:
 *       200:
 *         description: Successfully deleted consumed product
 *       404:
 *         description: Consumed product not found
 *       500:
 *         description: Server error
 */
router.delete("/consumed/:id", validateAuth, async (req, res) => {
  try {
    const consumedProductId = req.params.id;
    const userId = req.user._id;

    // Verificăm dacă înregistrarea produsului consumat există și aparține utilizatorului
    const consumedProduct = await ConsumedProduct.findOne({
      _id: consumedProductId,
      userId,
    });
    if (!consumedProduct) {
      return res.status(404).json({ message: "Consumed product not found" });
    }

    await ConsumedProduct.deleteOne({ _id: consumedProductId });

    res.status(200).json({ message: "Consumed product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/products/day-info:
 *   get:
 *     summary: Get all information about a specific day
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: The date to get information about
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                 totalCalories:
 *                   type: number
 *                 consumedProducts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ConsumedProduct'
 *       400:
 *         description: Date is required
 *       500:
 *         description: Server error
 */
router.get("/day-info", validateAuth, async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user._id;

    // Verificăm dacă data este furnizată
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Convertim data la formatul corect
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Găsim toate produsele consumate în acea zi de către utilizator
    const consumedProducts = await ConsumedProduct.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).populate("productId");

    // Calculăm totalul caloriilor consumate
    let totalCalories = 0;
    consumedProducts.forEach((consumedProduct) => {
      const productCaloriesPerGram =
        consumedProduct.productId.calories / consumedProduct.productId.weight;
      totalCalories += productCaloriesPerGram * consumedProduct.quantity;
    });

    res.json({
      date: startDate,
      totalCalories,
      consumedProducts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
