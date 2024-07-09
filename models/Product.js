// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  recommended: { type: Boolean, default: true },
});

module.exports = mongoose.model("Product", productSchema);
