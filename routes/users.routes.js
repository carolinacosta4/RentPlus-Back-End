const express = require("express");
const userController = require("../controllers/users.controller");
const authController = require("../controllers/auth.controller");

// express router
let router = express.Router();

// middleware for all routes related with users
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


router.route("/")
  // .get(authController.verifyToken, userController.findAll)
  .get(userController.findAll)
  .post(userController.multerUploads, userController.register); //MULTER AQUI

router.route('/role')
  .patch(authController.verifyToken, userController.editRole)

router.route("/:idU")
  // .get(authController.verifyToken, userController.findUser) //comentar aqui dps
  .get(userController.findUser)
  .patch(authController.verifyToken, userController.editProfile)
  .delete(authController.verifyToken, userController.delete);

router.route("/:idU/favorites")
  .post(authController.verifyToken, userController.addFavorite);

router.route("/:idU/favorites/:idP")
  .delete(authController.verifyToken, userController.removeFavorite);

router.route("/login")
  .post(userController.login);

router.route("/block/:idU")
  .patch(userController.editBlock);

router.route("/reset-password-email")
  .post(userController.recoverEmail);

router.route("/:idU/reviews")
  // .get(authController.verifyToken, userController.findUser)
  .get(userController.findOwnerReviews)

router.all("*", function (req, res) {
  //send an predefined error message
  res
    .status(400)
    .json({
      success: false,
      message: `The API does not recognize the request on ${req.method} ${req.originalUrl}`,
    });
});

module.exports = router;
