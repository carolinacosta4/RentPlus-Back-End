const express = require("express");
const userController = require("../controllers/users.controller");
const authController = require("../controllers/auth.controller");

let router = express.Router();

router.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const diffSeconds = (Date.now() - start) / 1000;
    console.log(
      `${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`
    );
  });
  next();
});

const multer = require('multer')
let storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single('inputProfilePicture');

router.route("/")
  .get(authController.verifyToken, userController.findAll)
  .post(multerUploads, userController.register)
  .patch(userController.resetPassword);

router.route("/:idU/change-profile-picture")
  .patch(authController.verifyToken, multerUploads, userController.changeProfilePicture)

router.route('/:idU/role')
  .patch(authController.verifyToken, userController.editRole)

router.route("/:idU")
  .get(userController.findUser)
  .patch(authController.verifyToken, userController.editProfile)
  .delete(authController.verifyToken, userController.delete);

router.route("/:idU/favorites")
  .post(authController.verifyToken, userController.addFavorite);

router.route("/:idU/favorites/:idP")
  .delete(authController.verifyToken, userController.removeFavorite);

router.route("/login")
  .post(userController.login);

router.route("/:idU/block")
  .patch(userController.editBlock);

router.route("/reset-password-email")
  .post(userController.recoverEmail);

router.route("/:idU/reviews")
  .get(userController.findOwnerReviews)

router.route("/:idU/confirmation")
  .patch(userController.confirmEmail)

router.all("*", function (req, res) {
  res
    .status(400)
    .json({
      success: false,
      message: `The API does not recognize the request on ${req.method} ${req.originalUrl}`,
    });
});

module.exports = router;