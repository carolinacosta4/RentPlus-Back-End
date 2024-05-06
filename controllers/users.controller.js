const db = require("../models/index.js");
const User = db.user;

//"Op" necessary for LIKE operator
const { Op, ValidationError } = require('sequelize');


// Display list of all users
exports.findAll = async (req, res) => {
    let { title } = req.query

    const condition = title ? { title: { [Op.like]: `%${title}%` } } : null
    try {
        let users = await User.findAll({ where: condition, raw: true })

        console.log(users);
        users.forEach(tut => {
            tut.links = [
                { "rel": "self", "href": `/users/${tut.username}`, "method": "GET" },
                { "rel": "delete", "href": `/users/${tut.username}`, "method": "DELETE" },
                { "rel": "modify", "href": `/users/${tut.username}`, "method": "PUT" },
            ]
        });
        res.status(200).json({
            success: true,
            data: users,
            links: [{ "rel": "add-user", "href": `/users`, "method": "POST" }]
        });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Some error occurred while retrieving the users."
        })
    }
};

// Handle user create on POST
exports.create = async (req, res) => {
    try {
        // save User in the database
        let newUser = await User.create(req.body);
        // return success message with username
        res.status(201).json({
            success: true,
            msg: "User successfully created.",
            links: [
                { "rel": "self", "href": `/users/${newUser.username}`, "method": "GET" },
                { "rel": "delete", "href": `/users/${newUser.username}`, "method": "DELETE" },
                { "rel": "modify", "href": `/users/${newUser.username}`, "method": "PUT" },
            ]
        });
    }
    catch (err) {
        if (err instanceof ValidationError)
            res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        else
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while creating the user."
            });
    };
};

// List just one user
exports.findOne = async (req, res) => {
    try {
        let user = await User.findByPk(req.params.idT)
        if (user === null) {
            return res.status(404).json({
                success: false,
                data: `Cannot find any user with username ${req.params.idT}`
            });
        }

        return res.json({
            success: true,
            data: user,
            links: [
                {
                    "rel": "delete", "href": `/users/${user.username}`,
                    "method": "DELETE"
                },
                {
                    "rel": "modify", "href": `/users/${user.username}`,
                    "method": "PUT"
                },
            ]
        });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: `Error retrieving user with username ${req.params.idT}.`
        });
    };
};

// Update a user
exports.update = async (req, res) => {
    try {
        let user = await User.findByPk(req.params.idT)
        if (user === null) {
            return res.status(404).json({
                success: false,
                data: `Cannot find any user with username ${req.params.idT}`
            });
        }

        let affectedRows = await User.update(req.body, { where: { username: req.params.idT } })
        if (affectedRows[0] === 0) {
            return res.status(200).json({
                success: true,
                msg: `No updates were made on user with username ${req.params.idT}.`
            })
        }

        return res.json({
            success: true,
            msg: `User with username ${req.params.idT} was updated successfully.`
        });
    }
    catch (err) {
        if (err instanceof ValidationError)
            return res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        res.status(500).json({
            success: false, msg: `Error updating user with username ${req.params.idT}.`
        });
    };
};

// Delete one user
exports.delete = async (req, res) => {
    try {
        let result = await User.destroy({ where: { username: req.params.idT } })
        if (result == 1) {
            return res.json({
                success: true,
                msg: `User with username ${req.params.idT} was successfully deleted!`
            });

        }

        return res.status(404).json({
            success: false,
            data: `Cannot find any user with username ${req.params.idT}`
        });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: `Error deleting user with username ${req.params.idT}.`
        });
    };
};

