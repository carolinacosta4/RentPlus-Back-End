const express = require('express');
const paymentController = require("../controllers/payments.controller");
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
    .get(paymentController.findAll)

router.route('/:ID')
    .get(authController.verifyToken, paymentController.findOne)


router.all('*', function (req, res) {
    res.status(400).json({ success: false, message: `The API does not recognize the request on ${req.method} ${req.originalUrl}` });
})

module.exports = router;