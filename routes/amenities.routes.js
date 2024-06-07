const express = require('express');
const AmenitiesController = require("../controllers/amenities.controller");
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
    .get(AmenitiesController.findAll)


module.exports = router;
