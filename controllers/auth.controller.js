const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/db.config.js");


const db = require("../models");
const User = db.user;

exports.verifyToken = (req, res, next) => {
    const header = req.headers['x-access-token'] || req.headers.authorization;
    if (typeof header == 'undefined')
        return res.status(401).json({ success: false, msg: "Invalid token or no token at all. Please log in again." });
    const bearer = header.split(' '); // Authorization header format: Bearer <token>
    const token = bearer[1];
    try {
        let decoded = jwt.verify(token, config.SECRET);
        req.loggedUserId = decoded.id; // save user ID and role into request object
        req.loggedUserRole = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, msg: "Unauthorized!" });
    }
};