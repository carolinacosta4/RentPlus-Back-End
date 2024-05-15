const express = require('express');
const ReservationController = require("../controllers/reservations.controller");
let router = express.Router();

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
    .post(ReservationController.bodyValidator, ReservationController.create)

router.route('/:ID')
    .get(ReservationController.findOne)


router.all('*', function (req, res) {
    res.status(400).json({ success: false, message: `The API does not recognize the request on ${req.method} ${req.originalUrl}` });
})

module.exports = router;