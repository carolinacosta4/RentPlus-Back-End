const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const config = require("../config/db.config.js");
const db = require("../models/index.js");
const User = db.user;
const Favorite = db.favorites

const { Op, ValidationError, Sequelize } = require("sequelize");

// Obtains general information about all users. Route only available for admins (authentication token must be provided in header). Has an optional limit counter.
exports.findAll = async (req, res) => {
  let { page, limit, sort } = req.query;

  const pageNumber = page && Number.parseInt(page) > 0 ? Number.parseInt(page) : 1;
  const limitValue = limit && Number.parseInt(limit) > 0 ? Number.parseInt(limit) : 10;
  const offset = (pageNumber - 1) * limitValue;

  if (sort) {
    if (sort.toLowerCase() != 'asc' && sort.toLowerCase() != 'desc') {
      return res.status(400).json({
        success: false,
        message: "Sort can only be 'asc' or 'desc'."
      });
    }
  }

  try {
    if (req.loggedUserRole !== "admin")
      return res.status(403).json({
        success: false,
        msg: "You don't have permission to access this route."
      });

    let users = await User.findAll({ limit: limitValue, offset: offset, order: [['username', sort.toUpperCase()]], raw: true });

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
  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

// Handles user registration to join the platform
exports.register = async (req, res) => {
  try {
    if (!req.body && !req.body.username && !req.body.password)
      return res.status(400).json({ success: false, msg: "Username and password are mandatory" });

    let searchUser = await User.findOne({ where: { username: req.body.username } })
    if (searchUser) {
      res.status(409).json({
        success: false,
        msg: "The username is already taken. Please choose another one."
      });
    } else {
      let newUser = await User.create({
        username: req.body.username, email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        phone_number: req.body.phone_number, profile_image: req.body.profile_image,
        first_name: req.body.first_name, last_name: req.body.last_name,
        is_confirmed: req.body.is_confirmed, user_role: req.body.user_role,
        owner_description: req.body.owner_description
      });

      res.status(201).json({
        success: true,
        msg: "User created successfully.",
        links: [
          { rel: "self", href: `/users/${newUser.username}`, method: "GET" },
          { rel: "login-user", href: `/users/login`, method: "POST" }
        ],
      });
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      res
        .status(400)
        .json({ success: false, msg: error.errors.map((e) => e.message) });
    } else if (error instanceof Sequelize.ConnectionError) {
      res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

// Obtains information about specified user. Route only available for admins (authentication token must be provided in header).
exports.findUser = async (req, res) => {
  let { field } = req.query;

  try {
    let userFound = await User.findByPk(req.params.idT)

    if (!userFound) {
      return res.status(404).json({
        success: false,
        msg: "The specified username does not exist.",
      });
    }

    let user

    if (field) {
      if (field == 'favorites') {
        user = await User.findByPk(req.params.idT, {
          include: [
            {
              model: db.favorites,
              as: 'favorites',
              attributes: ['property_ID']
            }
          ]
        });
      } else if (field == 'reservations') {
        user = await User.findByPk(req.params.idT, {
          include: [
            {
              model: db.reservation,
              as: 'reservations',
              attributes: ['dateIn']
            }
          ]
        });
      } else if (field == 'properties') {
        user = await User.findByPk(req.params.idT, {
          include: [
            {
              model: db.property,
              as: 'properties',
              attributes: ['title']
            }
          ]
        });
      }
    } else {
      if (userFound.user_role == 'owner') {
        user = await User.findByPk(req.params.idT, {
          include: [
            {
              model: db.favorites,
              as: 'favorites',
              attributes: ['property_ID']
            },
            {
              model: db.property,
              as: 'properties',
              attributes: ['title']
            },
            {
              model: db.message,
              as: 'messages_sent',
              attributes: ['content']
            },
            {
              model: db.message,
              as: 'messages_received',
              attributes: ['content']
            },
          ]
        });
      } else {
        user = await User.findByPk(req.params.idT, {
          include: [
            {
              model: db.favorites,
              as: 'favorites',
              attributes: ['property_ID']
            },
            {
              model: db.reservation,
              as: 'reservations',
              attributes: ['dateIn']
            },
            {
              model: db.review,
              as: 'reviews',
              attributes: ['comment']
            },
            {
              model: db.message,
              as: 'messages_sent',
              attributes: ['content']
            },
            {
              model: db.message,
              as: 'messages_received',
              attributes: ['content']
            },
          ]
        });
      }
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
  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};


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
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        msg: error.errors.map((e) => e.message)
      });
    } else if (error instanceof Sequelize.ConnectionError) {
      res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      res.status(500).json({
        success: false,
        msg: `Error updating user with username ${req.params.idT}.`,
      });
    }
  }
};

// Handles user account’s deletion.
exports.delete = async (req, res) => {
  try {
    if (req.loggedUserRole === "admin") {
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
    } else {
      if (req.loggedUserId == req.params.idT) {
        let result = await User.destroy({ where: { username: req.params.idT } });
        if (result == 1) {
          return res.json({
            success: true,
            msg: `Your account has been permanently deleted.`,
          });
        }

        return res.status(404).json({
          success: false,
          msg: `Your account does not exist.`,
        });
      } else {
        return res.status(403).json({
          success: false,
          msg: `You are not authorized to delete other users.`,
        });
      }
    }
  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

// Handles user login.
exports.login = async (req, res) => {
  try {
    if (!req.body || !req.body.username || !req.body.password)
      return res.status(400).json({ success: false, msg: "Must provide username and password." });

    let user = await User.findOne({ where: { username: req.body.username } });
    if (!user) return res.status(404).json({ success: false, msg: "User not found." });
    const check = bcrypt.compareSync(req.body.password, user.password);
    if (!check) return res.status(401).json({ success: false, accessToken: null, msg: "Invalid credentials!" });

    const token = jwt.sign({ id: user.username, role: user.user_role },
      config.SECRET, {
      expiresIn: '24h' // 24 hours
    });

    return res.status(200).json({ success: true, accessToken: token });

  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

exports.recoverEmail = async (req, res) => {
  try {
    console.log('Here');
    return res.json({
      "message": "Recovery Password email sent."
    });
  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

// Handle user adding favorites on POST
exports.addFavorite = async (req, res) => {
  try {
    if (!req.body.property_ID)
      return res.status(400).json({
        success: false,
        msg: "Property ID is mandatory"
      });

    await Favorite.create({
      username: req.params.idT,
      property_ID: req.body.property_ID,
    });

    res.status(200).json({
      success: true,
      msg: "Property added to favorites.",
      links: [
        { rel: "self", href: `/users/${req.params.idT}?field=favorites`, method: "GET" }
      ],
    });

  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

// Removes specified property from favorites 
exports.removeFavorite = async (req, res) => {
  try {
    let result = await Favorite.destroy({ where: { property_ID: req.params.idP } });
    if (result == 1) {
      return res.json({
        success: true,
        msg: `Property removed from favorites.`,
      });
    }

    return res.status(404).json({
      success: false,
      msg: `The specified property isn't favorited.`,
    });
  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};