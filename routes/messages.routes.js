const express = require('express');
const messageController = require("../controllers/messages.controller");
let router = express.Router();

router.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => { 
        const diffSeconds = (Date.now() - start) / 1000; 
        console.log(`${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`);
    });
    next()
})

router.route('/:username')
    .get(messageController.findAllOfLoggedUser);


// router.route('/')
//     .post(messageController.bodyValidator, messageController.create)
