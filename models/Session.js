// models/Session.js
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "7d", // Sesiunea va expira automat după 7 zile
  },
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
