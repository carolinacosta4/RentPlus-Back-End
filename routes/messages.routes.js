const express = require('express');
const MessageController = require("../controllers/messages.controller");
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
    .get(MessageController.findAll)

router.route('/')
    .post(MessageController.bodyValidator, MessageController.create)

router.route('/:username')
    .get(MessageController.findAllFromSpecificUser);

router.route('/:username/:ID')
    .delete(MessageController.deleteMessage);


module.exports = router;
