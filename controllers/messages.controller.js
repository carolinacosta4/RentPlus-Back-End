const db = require("../models/index.js");
const Message = db.message;
const { ValidationError } = require('sequelize');
const { Op } = require('sequelize');
const Property = db.property

// Only for programmers to analyze the changes made during testings
exports.findAll = async (req, res) => {

    try {
        const { limit = 20 } = req.query;

        const messages = await Message.findAndCountAll({
            limit: parseInt(limit),
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: messages.rows,
            pagination: {
                total: messages.count,
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: err.message || 'Some error occurred while retrieving the messages.'
        });
    }
};

// Obtains all messages of logged user (authentication token must be provided in header). Has an optional limit counter.
exports.findAllFromSpecificUser = async (req, res, next) => {
    if (req.loggedUserId == req.params.username) {
        try {
            const { limit = 20 } = req.query;

            const messages = await Message.findAndCountAll({
                where: {
                    [Op.or]: [
                        { sender_username: req.params.username },
                        { receiver_username: req.params.username }
                    ]
                },
                limit: parseInt(limit),
                order: [['created_at', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                data: messages.rows,
                pagination: {
                    total: messages.count,
                    limit: parseInt(limit)
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                msg: err.message || 'Some error occurred while retrieving the reservations.'
            });
        }
        next()
    }
    else {
        return res.status(403).json({
            success: false,
            error: "Forbidden",
            msg: "You don’t have permission to access this route. You need to be the user who sends or receives the message.",
        });
    }
};

exports.bodyValidator = async (req, res, next) => {
    if (!req.body.receiver_username || !req.body.content) {
        return res.status(400).json({
            error: "Some required information are missing"
        })
    }

    if (req.body.property_ID != null) {
        const property = await Property.findByPk(req.body.property_ID);
        if (!property) {
            return res.status(404).json({
                error: `There is no property with the ID ${req.body.property_ID}`
            });
        }
    }


    const receiverUser = await db.user.findOne({ where: { username: req.body.receiver_username } });
    if (!receiverUser) {
        return res.status(400).json({
            error: `The username ${req.body.receiver_username} does not exist`
        });
    }
    next()
};

// Handles sending messages to another user (authentication token must be provided in header).
exports.create = async (req, res) => {
    try {
        const createdAt = new Date();

        const newMessage = await Message.create({
            receiver_username: req.body.receiver_username,
            sender_username: req.loggedUserId,
            content: req.body.content,
            created_at: createdAt,
            property_ID: req.body.property_ID
        });


        return res.status(201).json({
            success: true,
            msg: "Message successfully created.",
            data: newMessage
        });
    }
    catch (err) {
        if (err instanceof ValidationError)
            res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        else
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while sending the message."
            });
    };
};

// Handles deletion of a sent message (authentication token must be provided in header).
exports.deleteMessage = async (req, res) => {
    if (req.loggedUserId == req.params.username) {
        try {
            const messageID = req.params.ID;
            const msgm = await Message.findByPk(messageID);
            const senderUser = req.params.username

            if (!msgm) {
                return res.status(404).json({
                    success: false,
                    msg: `Can't find any message with id ${messageID}`
                });
            }

            await msgm.destroy();
            return res.status(200).json({
                success: true,
                msg: 'Message successfully deleted.'
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                msg: err.message || 'Some error occurred while deleting the message.'
            });
        }
    }
    else {
        return res.status(403).json({
            success: false,
            error: "Forbidden",
            msg: "You don’t have permission to access this route. You need to be the user who sends the message in order to delete it.",
        });
    }
};