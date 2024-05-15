const db = require("../models/index.js");
const Message = db.message;
const { ValidationError } = require('sequelize');
const { create } = require("./reservations.controller.js");


exports.findAll = async (req, res) => {
    try {
        // const username = req.user.username; // Obtém o nome de usuário do token de autenticação

        const username = req.params.username
        const { limit = 20 } = req.query;

        const messages = await Message.findAndCountAll({
            where: { username },
            limit: parseInt(limit),
            offset: offset,
            order: [[sort, 'ASC']]
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
};

exports.bodyValidator = async (req, res, next) => {    
    if (!req.body.receiver_username || !req.body.sender_username  || !req.body.content) {
        return res.status(400).json({
            error: "Some required information are missing"
        })
    }
    next()    
};


// bodyValidator
// create
