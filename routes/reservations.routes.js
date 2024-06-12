const express = require('express');
const ReservationController = require("../controllers/reservations.controller");
const PaymentController = require("../controllers/payments.controller");
let router = express.Router();
const authController = require("../controllers/auth.controller");

router.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const diffSeconds = (Date.now() - start) / 1000;
        console.log(`${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`);
    });
    next()
})


router.route('/')
    .get(ReservationController.findAll)
    // .post(authController.verifyToken, ReservationController.bodyValidator, ReservationController.create)
    .post(ReservationController.bodyValidator, ReservationController.create)

router.route('/:username/:ID')
    .get(authController.verifyToken, ReservationController.findOne)

    // este deve ser na de cima
router.route('/:ID')
    .delete(authController.verifyToken, ReservationController.deleteReservation)

router.route('/:username')
    .get(authController.verifyToken, ReservationController.getUserReservations)

router.route('/:ID/status')
    .patch(authController.verifyToken, ReservationController.changeStatus) 

router.route('/:ID/payments/status')
    .patch(authController.verifyToken, PaymentController.changeStatus) 

router.all('*', function (req, res) {
    res.status(400).json({ success: false, message: `The API does not recognize the request on ${req.method} ${req.originalUrl}` });
})

module.exports = router;