const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

// Importarea rutelor
const publicRoutes = require("./routes/public");
const protectedRoutes = require("./routes/protected");
const searchRoutes = require("./routes/search");
const consumedProductRoutes = require("./models/ConsumedProduct");
const dailyIntakeRoutes = require("./models/DailyIntake");

// Importați documentul Swagger
const swaggerDocument = require("./swagger.json");

const app = express();

// Middleware pentru a permite cererile JSON și CORS
app.use(bodyParser.json());
app.use(cors());

// Conectarea la baza de date MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Middleware pentru a adăuga antete pentru a permite accesul de la alte domenii
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Rute publice
app.use("/api/public", publicRoutes);

// Rute protejate (necesită autentificare)
app.use("/api/protected", protectedRoutes);

// Rute pentru căutare
app.use("/api/search", searchRoutes);

// Rute pentru consumed products și daily intake
app.use("/api/consumedproduct", consumedProductRoutes);
app.use("/api/dailyintake", dailyIntakeRoutes);

// Utilizarea Swagger UI pentru documentația API-ului
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware pentru gestionarea erorilor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Pornirea serverului
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
