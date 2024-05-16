const db = require("../models/index.js");
const Message = db.message;
const { ValidationError } = require('sequelize');

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


exports.findAllFromSpecificUser = async (req, res, next) => {
    try {
        // const username = req.user.username; // Obtém o nome de usuário do token de autenticação

        const sender_username = req.params.username
        const { limit = 20 } = req.query;

        const messages = await Message.findAndCountAll({
            where: { sender_username },
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
            msg: err.message || 'Some error occurred while retrieving the bookings.'
        });
    }
    next()
};

exports.bodyValidator = async (req, res, next) => {    
    if (!req.body.receiver_username || !req.body.sender_username  || !req.body.content) {
        return res.status(400).json({
            error: "Some required information are missing"
        })
    }

    const receiverUser = await db.user.findOne({ where: { username: req.body.receiver_username } });
    const senderUser = await db.user.findOne({ where: { username: req.body.sender_username } });
    if (!receiverUser) {
        return res.status(400).json({
            error: `The username ${req.body.receiver_username} does not exist`
        });
    }
    if (!senderUser) {
        return res.status(400).json({
            error: `The username ${req.body.sender_username} does not exist`
        });
    }
    next()    
};

exports.create = async (req, res) => {
    try {
        const { receiver_username, sender_username, content } = req.body;
        const createdAt = new Date();

        const newMessage = await Message.create({
            receiver_username,
            sender_username,
            content,
            created_at: createdAt
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

exports.deleteMessage = async (req, res) => {
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

        if(msgm.sender_username != senderUser){
            return res.status(401).json({
                success: false,
                msg: `Only senders can delete their own messages`
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
};