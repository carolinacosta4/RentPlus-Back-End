const express = require("express");
const propertyController = require("../controllers/properties.controller");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// Middleware for all routes related to properties
router.use((req, res, next) => {
  next();
});

// ROTAS
router
  .route("/")
  .get(propertyController.findAll)
  .post(authController.verifyToken, propertyController.createProperty);

router
  .route("/:idT")
  .get(propertyController.findProperty)
  .patch(authController.verifyToken, propertyController.editProperty)
  .delete(authController.verifyToken, propertyController.deleteProperty);

router
  .route("/:idT/reviews")
  .get(propertyController.findReviews)
  .post(authController.verifyToken, propertyController.createReview);

router
  .route("/:idT/reviews/:idR")
  .put(propertyController.updateReview)
  .delete(propertyController.deleteReview);

// Define a catch-all route for unrecognized requests
router.all("*", (req, res) => {
  res.status(400).json({
    success: false,
    message: `The API does not recognize the request on ${req.method} ${req.originalUrl}`,
  });
});

module.exports = router;
