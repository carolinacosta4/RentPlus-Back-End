const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");


exports.verifyToken = (req, res, next) => {
    const header = req.headers['x-access-token'] || req.headers.authorization;
    if (typeof header == 'undefined')
        return res.status(401).json({ success: false, msg: "Invalid token or no token at all. Please log in again." });
    const bearer = header.split(' ');
    const token = bearer[1];
    try {
        let decoded = jwt.verify(token, config.SECRET);
        req.loggedUserId = decoded.id;
        req.loggedUserRole = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, msg: "Unauthorized!" });
    }
};