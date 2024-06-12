const express = require('express');
const paymentTypeController = require("../controllers/paymentType.controller");
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
    // .get(authController.verifyToken, paymentTypeController.findAll)
    .get(paymentTypeController.findAll)

module.exports = router;