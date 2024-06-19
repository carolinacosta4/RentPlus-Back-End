const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const config = require("../config/db.config.js");
const db = require("../models/index.js");
const User = db.user;
const Favorite = db.favorites
const Property = db.property

const { ValidationError, Sequelize } = require("sequelize");

const cloudinary = require("cloudinary").v2;
// cloudinary configuration
cloudinary.config({
  cloud_name: config.C_CLOUD_NAME,
  api_key: config.C_API_KEY,
  api_secret: config.C_API_SECRET
});

exports.changeProfilePicture = async (req, res) => {
  try {
    let user = await User.findByPk(req.params.idU);
    if (user === null) {
      return res.status(404).json({
        success: false,
        msg: `Cannot find any user with username ${req.params.idU}`,
      });
    }
    if (req.loggedUserId == req.params.idU) {
      let user_image = null;
      if (req.file) {
        if (user.cloudinary_id) {
          await cloudinary.uploader.destroy(user.cloudinary_id);
        }
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = `data:${req.file.mimetype};base64,${b64}`;
        let result = await cloudinary.uploader.upload(dataURI, { resource_type: "auto" });
        user_image = result;
      }

      await User.update({
        profile_image: user_image ? user_image.url : null,
        cloudinary_id: user_image ? user_image.public_id : null
      }, { where: { username: req.params.idU } });

      return res.status(201).json({
        success: true,
        profile_image: user_image ? user_image.url : null,
        cloudinary_id: user_image ? user_image.public_id : null,
        msg: "Profile picture updated successfully!"
      });
    }

    return res.status(403).json({
      success: false,
      msg: "You are not authorized to edit other users.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, msg: 'An error occurred while updating profile picture.' });
  }
};

// Obtains general information about all users. Route only available for admins. Has an optional limit counter.
exports.findAll = async (req, res) => {
  let { page, limit, sort } = req.query;

  const pageNumber = page && Number.parseInt(page) > 0 ? Number.parseInt(page) : 1;
  const limitValue = limit && Number.parseInt(limit) > 0 ? Number.parseInt(limit) : null;
  const offset = (pageNumber - 1) * limitValue;
  let users

  try {
    if (req.loggedUserRole !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "You don't have permission to access this route."
      });
    }

    if (sort) {
      if (sort.toLowerCase() != 'asc' && sort.toLowerCase() != 'desc') {
        return res.status(400).json({
          success: false,
          message: "Sort can only be 'asc' or 'desc'."
        });
      }
      users = await User.findAll({ limit: limitValue, offset: offset, order: [['username', sort.toUpperCase()]], raw: true });
    } else {
      users = await User.findAll({ limit: limitValue, offset: offset, raw: true });
    }

    users.forEach((user) => {
      user.links = [
        { rel: "self", href: `/users/${user.username}`, method: "GET" },
        { rel: "delete", href: `/users/${user.username}`, method: "DELETE" },
        { rel: "modify", href: `/users/${user.username}`, method: "PUT" },
      ];
    });

    return res.status(200).json({
      success: true,
      pagination: [{
        "total": `${users.length}`,
        "current": `${pageNumber}`,
        "limit": `${limitValue}`
      }],
      data: users,
      links: [{ rel: "add-user", href: `/users`, method: "POST" }],
    });
  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      return res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: config.MAIL_USER,
    pass: config.MAIL_PASSWORD
  }
});

// Handles user registration to join the platform
exports.register = async (req, res) => {
  try {
    if (!req.body || !req.body.username || !req.body.password || !req.body.email || !req.body.first_name || !req.body.last_name) {
      return res.status(400).json({ success: false, msg: "Fisrt name, last name, username, email and password are mandatory" });
    }

    let searchUser = await User.findOne({ where: { username: req.body.username } })
    if (searchUser) {
      return res.status(409).json({
        success: false,
        msg: "The username is already taken. Please choose another one."
      });
    }

    let searchUserEmail = await User.findOne({ where: { email: req.body.email } })
    if (searchUserEmail) {
      return res.status(409).json({
        success: false,
        msg: "The email is already in use. Please choose another one."
      });
    }

    const createdAt = new Date();


    let newUser = await User.create({
      username: req.body.username, email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      phone_number: req.body.phone_number, profile_image: req.body.profile_image,
      first_name: req.body.first_name, last_name: req.body.last_name,
      is_confirmed: false, user_role: req.body.user_role,
      owner_description: req.body.owner_description,
      created_at: createdAt,
      profile_image: "https://res.cloudinary.com/ditdnslga/image/upload/v1718780629/userPlaceHolder_l1dvdi.png",
      cloudinary_id: "defaultProfileImage"
    });

    const mailOptions = {
      from: config.MAIL_USER,
      to: newUser.email,
      subject: 'Almost There! Confirm Your Email for Rent Plus',
      html: `<div style="font-family: 'Inter', sans-serif; font-weight: 300; text-align: center; padding: 20px; font-size: 14px;">
            <h1 style="font-family: 'Inter', sans-serif; font-weight: 600;">Welcome to Rent+, ${newUser.first_name}!</h1>
            <p>We're thrilled to have you on board! To get started, please confirm your email address by clicking the button below:</p>
            <p style="margin: 30px 0; font-size: 16px;"><a href="http://localhost:4000/confirmation/${newUser.username}" style="color: #ffffff; background-color: #133e1a; padding: 15px 25px; text-decoration: none; border-radius: 8px;">Confirm Email</a></p>
            <p>Once confirmed, you'll be able to explore all the features we have to offer!</p>
            <p>If you didn't sign up for Rent+, no worries! Simply ignore this email.</p>
            <p>Looking forward to helping you find your next vacation home!</p>
            <p>Cheers,<br>Rent+ Team</p>
            <p>🏠✨</p>
        </div>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Failed to send confirmation email:', error);
        return res.status(201).json({ success: true, msg: 'User created, but failed to send confirmation email' });
      } else {
        return res.status(201).json({
          success: true,
          msg: "User created successfully.",
          links: [
            { rel: "self", href: `/users/${newUser.username}`, method: "GET" },
            { rel: "login-user", href: `/users/login`, method: "POST" }
          ],
        });
      }
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ success: false, msg: error.errors.map((e) => e.message) });
    } else if (error instanceof Sequelize.ConnectionError) {
      return res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

// Obtains information about specified user. Route only available for admins.
exports.findUser = async (req, res) => {
  let { field } = req.query;

  try {
    let userFound = await User.findByPk(req.params.idU)

    if (!userFound) {
      return res.status(404).json({
        success: false,
        msg: "The specified username does not exist.",
      });
    }

    let user

    if (field) {
      if (field == 'favorites') {
        user = await User.findByPk(req.params.idU, {
          include: [
            {
              model: db.favorites,
              as: 'favorites',
              attributes: ['property_ID'],
              include: [
                {
                  model: db.property,
                  as: 'properties'
                }
              ]
            }
          ]
        });
      } else if (field == 'reservations') {
        user = await User.findByPk(req.params.idU, {
          include: [
            {
              model: db.reservation,
              as: 'reservations',
              attributes: ['dateIn']
            }
          ]
        });
      } else if (field == 'properties' & userFound.user_role == "owner") {
        user = await User.findByPk(req.params.idU, {
          include: [
            {
              model: db.property,
              as: 'properties',
              attributes: ['title', 'ID', 'daily_price', 'location', 'is_blocked'],
              include: [
                {
                  model: db.reservation,
                  as: "reservations"
                },
                {
                  model: db.photos_property,
                  as: "photos"
                },
              ]
            }
          ]
        });
      } else if (field == 'properties' & userFound.user_role != "owner") {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
          msg: "This user is not an owner."
        });
      } else {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
          msg: "Invalid field requested."
        });
      }
    } else {
      if (userFound.user_role == 'owner') {
        user = await User.findByPk(req.params.idU, {
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
        user = await User.findByPk(req.params.idU, {
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
      return res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

// Handles user profile editing.
exports.editProfile = async (req, res) => {
  try {
    let user = await User.findByPk(req.params.idU);
    if (user === null) {
      return res.status(404).json({
        success: false,
        msg: `Cannot find any user with username ${req.params.idU}`,
      });
    }

    if (req.loggedUserId == req.params.idU) {
      if (!req.body || Object.keys(req.body).length == 0) {
        return res.status(400).json({
          success: false,
          msg: "At least one field must be provided to update.",
        });
      } else if (!req.body.first_name & !req.body.last_name & !req.body.username & !req.body.phone_number & !req.body.owner_description) {
        return res.status(400).json({
          success: false,
          msg: "You can only edit your first name, last name, username, phone number or description.",
        });
      }

      let affectedRows = await User.update(req.body, {
        where: { username: req.params.idU },
      });


      if (affectedRows[0] === 0) {
        return res.status(200).json({
          success: true,
          msg: `No updates were made on user with username ${req.params.idU}.`,
        });
      }

      if (req.body.username) {
        const updatedUser = await User.findOne({ where: { username: req.body.username } })
        const updatedToken = jwt.sign({ id: updatedUser.username, role: updatedUser.user_role },
          config.SECRET, {
          expiresIn: '1h'
        })

        return res.json({
          success: true,
          msg: `User with username ${req.params.idU} was updated successfully.`,
          newToken: updatedToken
        });
      }


      return res.json({
        success: true,
        msg: `User with username ${req.params.idU} was updated successfully.`,
      });
    }

    return res.status(403).json({
      success: false,
      msg: "You are not authorized to edit other users.",
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        msg: error.errors.map((e) => e.message)
      });
    } else if (error instanceof Sequelize.ConnectionError) {
      return res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        success: false,
        msg: `Error updating user with username ${req.params.idU}.`,
      });
    }
  }
};

// Handles user account’s deletion.
exports.delete = async (req, res) => {
  try {
    if (req.loggedUserRole === "admin") {
      let result = await User.destroy({ where: { username: req.params.idU } });
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
      if (req.loggedUserId == req.params.idU) {
        let result = await User.destroy({ where: { username: req.params.idU } });
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
      return res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        error: "Server Error",
        error2: error,
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
    if (!user.is_confirmed) return res.status(400).json({ success: false, msg: "Email not confirmed." });

    const check = bcrypt.compareSync(req.body.password, user.password);
    if (!check) return res.status(401).json({ success: false, accessToken: null, msg: "Invalid credentials!" });

    let isBlocked = user.is_blocked
    if (isBlocked) {
      return res.status(403).json({ success: false, accessToken: null, msg: "User blocked" });
    }

    const token = jwt.sign({ id: user.username, role: user.user_role },
      config.SECRET, {
      expiresIn: '1h'
    });

    return res.status(200).json({ success: true, accessToken: token });
  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      return res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

exports.recoverEmail = async (req, res) => {
  try {
    if (!req.body.email)
      return res.status(400).json({
        success: false,
        msg: "Email is mandatory."
      });

    const user = await User.findOne({ where: { email: req.body.email } })
    if (!user)
      return res.status(400).json({
        success: false,
        msg: "User not found."
      });

    const mailOptions = {
      from: config.MAIL_USER,
      to: user.email,
      subject: 'Password Reset',
      html: `<div style="font-family: 'Inter', sans-serif; font-weight: 300; text-align: center; padding: 20px; font-size: 14px;">
      <h1 style="font-family: 'Inter', sans-serif; font-weight: 600;">Password Reset Request</h1>
      <p>We received a request to reset your password. To proceed, please click the button below:</p>
      <p style="margin: 30px 0; font-size: 16px;"><a href="http://localhost:4000/reset-password/${user.username}" style="color: #ffffff; background-color: #133e1a; padding: 15px 25px; text-decoration: none; border-radius: 8px;">Reset Password</a></p>
      <p>If you didn't request a password reset, no worries! Simply ignore this email.</p>
      <p>Cheers,<br>Rent+ Support Team</p>
      <p>🔒✨</p>
      </div>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({
          success: false,
          msg: 'Failed to send recovery email.'
        });
      }
      return res.json({
        success: true,
        msg: "Recovery Password email sent."
      });
    });
  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      return res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

exports.resetPassword = async (req, res) => {
  try {
    if (!req.body.password || !req.body.username)
      return res.status(400).json({
        success: false,
        msg: "Password and username are mandatory."
      });

    const user = await User.findOne({ where: { username: req.body.username } })
    if (!user)
      return res.status(400).json({
        success: false,
        msg: "User not found."
      });

    await User.update({ password: bcrypt.hashSync(req.body.password, 10) }, {
      where: { username: req.body.username },
    });

    return res.json({
      success: true,
      msg: `User with username ${req.body.username} was updated successfully.`,
    });
  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      return res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

// Handle user adding favorites on POST
exports.addFavorite = async (req, res) => {
  try {
    if (!req.body.property_ID) {
      return res.status(400).json({
        success: false,
        msg: "Property ID is mandatory"
      });
    }

    let property = await Property.findOne({ where: { ID: req.body.property_ID } })
    if (!property) {
      return res.status(404).json({
        success: false,
        msg: "The specified properties ID does not exist."
      });
    }

    let favorite = await Favorite.findOne({ where: { username: req.params.idU, property_ID: req.body.property_ID } })
    if (favorite) {
      return res.status(404).json({
        success: false,
        msg: "Favorite already added."
      });
    }

    await Favorite.create({
      username: req.params.idU,
      property_ID: req.body.property_ID,
    });

    return res.status(200).json({
      success: true,
      msg: "Property added to favorites.",
      links: [
        { rel: "self", href: `/users/${req.params.idU}?field=favorites`, method: "GET" }
      ],
    });

  } catch (error) {
    console.error(error)
    if (error instanceof Sequelize.ConnectionError) {
      return res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

// Removes specified property from favorites 
exports.removeFavorite = async (req, res) => {
  try {
    let user = await User.findOne({ where: { username: req.params.idU } })
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "The specified username does not exist."
      });
    }

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
      return res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

// Handles user profile editing.
exports.editBlock = async (req, res) => {
  try {
    let msg
    let user = await User.findByPk(req.params.idU);
    if (user === null) {
      return res.status(404).json({
        success: false,
        msg: `Cannot find any user with username ${req.params.idU}`,
      });
    }

    await User.update({ is_blocked: !user.is_blocked }, {
      where: { username: req.params.idU },
    });

    let updatedUser = await User.findByPk(req.params.idU);

    if (updatedUser.is_blocked) {
      msg = `User with username ${req.params.idU} was blocked.`
    } else {
      msg = `User with username ${req.params.idU} was unblocked.`
    }

    return res.json({
      success: true,
      msg: msg,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        msg: error.errors.map((e) => e.message)
      });
    } else if (error instanceof Sequelize.ConnectionError) {
      return res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        success: false,
        msg: `Error updating user with username ${req.params.idU}.`,
      });
    }
  }
};

exports.confirmEmail = async (req, res) => {
  try {
    let user = await User.findByPk(req.params.idU);
    if (user === null) {
      return res.status(404).json({
        success: false,
        msg: `Cannot find any user with username ${req.params.idU}`,
      });
    }

    await User.update({ is_confirmed: true }, {
      where: { username: req.params.idU }
    });

    return res.json({
      success: true,
      msg: 'User email confirmed.',
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        msg: error.errors.map((e) => e.message)
      });
    } else if (error instanceof Sequelize.ConnectionError) {
      return res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        success: false,
        msg: `Error updating user with username ${req.params.idU}.`,
      });
    }
  }
};

// Handles updating user role.
exports.editRole = async (req, res) => {
  try {
    if (req.params.idU != req.loggedUserId)
      return res.status(400).json({
        success: false,
        msg: "You are not authorized to perform this action.",
      });

    if (!req.body.user_role) {
      return res.status(400).json({
        success: false,
        msg: "The new role must be provided to update.",
      });
    }

    let affectedRows = await User.update({ user_role: req.body.user_role }, {
      where: { username: req.loggedUserId },
    });

    if (affectedRows[0] === 0) {
      return res.status(200).json({
        success: true,
        msg: `No updates were made on user with username ${req.loggedUserId}.`,
      });
    }

    const user = await User.findOne({ where: { username: req.loggedUserId } })
    const newToken = jwt.sign({ id: user.username, role: user.user_role },
      config.SECRET, {
      expiresIn: '1h'
    });

    return res.json({
      success: true,
      msg: `User with username ${req.loggedUserId} was updated successfully.`,
      accessToken: newToken,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        msg: error.errors.map((e) => e.message)
      });
    } else if (error instanceof Sequelize.ConnectionError) {
      return res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        success: false,
        msg: `Error updating user with username ${req.params.idU}.`,
      });
    }
  }
}

exports.findOwnerReviews = async (req, res) => {
  try {
    let userFound = await User.findByPk(req.params.idU)
    if (!userFound) {
      return res.status(404).json({
        success: false,
        msg: "The specified username does not exist.",
      });
    }

    const properties = await db.property.findAll({
      attributes: ['ID', 'owner_username'],
      where: { owner_username: req.params.idU },
      raw: true
    });
    const propertiesFound = properties.map(property => property.ID);

    const reservations = await db.reservation.findAll({
      attributes: ['property_ID', 'ID'],
      where: { property_ID: propertiesFound },
      raw: true
    });
    const reservationsFound = reservations.map(reservation => reservation.ID);

    const reviews = await db.review.findAll({
      attributes: ['rating'],
      where: { reservation_ID: reservationsFound },
      raw: true
    });

    if (reviews.length > 0) {
      return res.json({
        success: true,
        data: reviews,
      });
    } else {
      return res.status(200).json({
        success: true,
        msg: "No review found."
      });
    }
  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      return res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        error: "Server Error",
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};