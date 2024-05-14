const db = require("../models/index.js");
const User = db.user;

const { Op, ValidationError } = require("sequelize");

// Obtains general information about all users. Route only available for admins (authentication token must be provided in header). Has an optional limit counter.
exports.findAll = async (req, res) => {
  let { page, limit } = req.query;

  const pageNumber = page && Number.parseInt(page) > 0 ? Number.parseInt(page) : 1;
  // const sizeNumber = limit && Number.parseInt(limit) > 0 ? Number.parseInt(limit) : 10;

  // const limitValue = sizeNumber;
  const limitValue = limit && Number.parseInt(limit) > 0 ? Number.parseInt(limit) : 10;
  const offset = (pageNumber - 1) * limitValue;


  try {
    let users = await User.findAll({ limit: limitValue, offset: offset, raw: true });

    users.forEach((user) => {
      user.links = [
        { rel: "self", href: `/users/${user.username}`, method: "GET" },
        { rel: "delete", href: `/users/${user.username}`, method: "DELETE" },
        { rel: "modify", href: `/users/${user.username}`, method: "PUT" },
      ];
    });

    const pages = limitValue == users.length ? users.length / limitValue : 1

    res.status(200).json({
      success: true,
      pagination: [{
        "total": `${users.length}`,
        "pages": `${pages}`,
        "current": `${pageNumber}`,
        "limit": `${limitValue}`
      }],
      data: users,
      links: [{ rel: "add-user", href: `/users`, method: "POST" }],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "An unexpected error occurred. Please try again later.",
    });
  }
};

// Handles user registration to join the platform
exports.register = async (req, res) => {
  try {
    const emailFound = await User.findOne({ where: { email: req.body.email } });

    if (!emailFound) {
      let newUser = await User.create(req.body);
      res.status(201).json({
        success: true,
        msg: "User created successfully.",
        links: [
          { rel: "self", href: `/users/${newUser.username}`, method: "GET" },
          { rel: "login-user", href: `/users/login`, method: "POST" }
        ],
      });
    } else {
      res.status(409).json({
        msg: "The email address is already associated with another account.",
      });
    }

  } catch (err) {
    if (err instanceof ValidationError)
      res
        .status(400)
        .json({ success: false, msg: err.errors.map((e) => e.message) });
    else
      res.status(500).json({
        success: false,
        msg: err.message || "Some error occurred while creating the user.",
      });
  }
};

// Obtains information about specified user. Route only available for admins (authentication token must be provided in header).
exports.findUser = async (req, res) => {
  try {
    let user = await User.findByPk(req.params.idT);
    if (user === null) {
      return res.status(404).json({
        success: false,
        msg: `The specified username does not exist.`,
      });
    }

    return res.json({
      success: true,
      data: user,
      links: [
        {
          rel: "delete",
          href: `/users/${user.username}`,
          method: "DELETE",
        },
        {
          rel: "modify",
          href: `/users/${user.username}`,
          method: "PUT",
        },
      ],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: `An unexpected error occurred. Please try again later.`,
    });
  }
};

// Update a user
exports.update = async (req, res) => {
  try {
    let user = await User.findByPk(req.params.idT);
    if (user === null) {
      return res.status(404).json({
        success: false,
        data: `Cannot find any user with username ${req.params.idT}`,
      });
    }

    let affectedRows = await User.update(req.body, {
      where: { username: req.params.idT },
    });
    if (affectedRows[0] === 0) {
      return res.status(200).json({
        success: true,
        msg: `No updates were made on user with username ${req.params.idT}.`,
      });
    }

    return res.json({
      success: true,
      msg: `User with username ${req.params.idT} was updated successfully.`,
    });
  } catch (err) {
    if (err instanceof ValidationError)
      return res
        .status(400)
        .json({ success: false, msg: err.errors.map((e) => e.message) });
    res.status(500).json({
      success: false,
      msg: `Error updating user with username ${req.params.idT}.`,
    });
  }
};

// Delete one user
exports.delete = async (req, res) => {
  try {
    let result = await User.destroy({ where: { username: req.params.idT } });
    if (result == 1) {
      return res.json({
        success: true,
        msg: `User permanently deleted successfully.`,
      });
    }

    return res.status(404).json({
      success: false,
      msg: `The specified username does not exist.`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: `An unexpected error occurred. Please try again later.`,
    });
  }
};

// Handles user login.
exports.login = async (req, res) => {
  try {
    return res.json({
      success: true,
      msg: `User!`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while creating the user.",
    });
  }
};

// Handle user recovery email on POST
exports.recoverEmail = async (req, res) => {
  try {
    console.log('Here');
    return res.json({
      "message": "Recovery Password email sent."
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while creating the user.",
    });
  }
};

// Handle user adding favorites on POST
exports.favorites = async (req, res) => {
  try {
    console.log('Here');
    return res.json({
      "message": "Property added to favorites."
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while creating the user.",
    });
  }
};