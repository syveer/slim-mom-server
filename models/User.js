const mongoose = require("mongoose");

// Definirea schemei pentru utilizatori
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // Alte câmpuri ale schemei...
});

// Crearea modelului utilizator pe baza schemei definite
const User = mongoose.model("User", userSchema);

module.exports = User;
