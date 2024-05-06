const express = require("express");
const propertyController = require("../controllers/properties.controller"); // Corrected import statement

const router = express.Router();

// Middleware for all routes related to properties
router.use((req, res, next) => {
  next();
});

// ROTAS
router.route("/").get(propertyController.findAll);

// Define a catch-all route for unrecognized requests
router.all("*", (req, res) => {
  res.status(400).json({
    success: false,
    message: `The API does not recognize the request on ${req.method} ${req.originalUrl}`,
  });
});

module.exports = router;
