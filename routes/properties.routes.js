const express = require("express");
const propertyController = require("../controllers/properties.controller");
const authController = require("../controllers/auth.controller");

const router = express.Router();

const multer = require('multer')
let storage = multer.memoryStorage();
const multerUploads = multer({ storage }).fields([{name: 'inputPropertyImages', maxCount: 20}]);

router.use((req, res, next) => {
  next();
});

router.route("/")
  .get(propertyController.findAll)
  .post(authController.verifyToken, multerUploads, propertyController.createProperty);

router.route("/:idP")
  .get(propertyController.findProperty)
  .patch(authController.verifyToken, multerUploads, propertyController.editProperty)
  .delete(authController.verifyToken, propertyController.deleteProperty);

router.route("/:idP/reviews")
  .get(propertyController.findReviews)
  .post(authController.verifyToken, propertyController.createReview);

router.route("/:idP/reviews/:idR")
  .delete(authController.verifyToken, propertyController.deleteReview);

router.route("/:idP/block")
  .patch(propertyController.editBlock);

router.all("*", (req, res) => {
  res.status(400).json({
    success: false,
    message: `The API does not recognize the request on ${req.method} ${req.originalUrl}`,
  });
});

module.exports = router;