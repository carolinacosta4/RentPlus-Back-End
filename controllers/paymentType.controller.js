const db = require("../models/index.js");
const { ValidationError } = require('sequelize');
const PaymentType = db.payment_type

exports.findAll = async (req, res) => {
    try {
        const types = await PaymentType.findAll()
        res.status(200).json({
            success: true,
            data: types,
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};