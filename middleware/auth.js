// middleware/auth.js
const jwt = require("jsonwebtoken");
const Session = require("../models/Session");

module.exports = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  if (!token) {
    return res.status(401).send({ message: "Access denied" });
  }
  try {
    const decoded = jwt.verify(token, "your_secret_key");
    const session = await Session.findOne({ accessToken: token });
    if (!session) {
      return res.status(401).send({ message: "Access denied" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ message: "Invalid token" });
  }
};
