// propertyController.js
const db = require("../models/index.js");
const Property = db.property;
const Review = db.review;
const Reservation = db.reservation

const { Op, ValidationError, Sequelize } = require("sequelize");

// Obtains general information about all properties. Can be filtered by properties type.
exports.findAll = async (req, res) => {
  let { type, page, limit } = req.query;

  const pageNumber = page && Number.parseInt(page) > 0 ? Number.parseInt(page) : 1;
  const limitValue = limit && Number.parseInt(limit) > 0 ? Number.parseInt(limit) : 10;
  const offset = (pageNumber - 1) * limitValue;

  try {
    if (type != undefined) {
      const propertyTypes = await db.property_type.findAll({
        attributes: ['type_name'],
        raw: true
      });

      const types = propertyTypes.map(type => type.type_name.toLowerCase());

      if (type & !types.includes(type.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: "Invalid type values",
          message: `Type can only be one of the following: ${types.join(', ')}`
        });
      }
    }

    const typeCondition = type ? { type_name: { [Op.like]: type } } : null;

    const properties = await Property.findAll({
      limit: limitValue, offset: offset, raw: true,
      include: [
        {
          model: db.property_type,
          as: 'type_of_prop',
          where: typeCondition,
          attributes: ['type_name']
        },
        {
          model: db.photos_property,
          as: 'photos',
          attributes: ['photo']
        },
        // {
        //   model: db.amenity,
        //   as: 'amenities',
        //   attributes: ['amenity_name']
        // },
      ]
    });

    if (properties.length > 0) {
      const totalPages = properties.length / limitValue;

      properties.forEach((property) => {
        property.links = [
          { rel: "self", href: `/properties/${properties.ID}`, method: "GET" },
          { rel: "delete", href: `/properties/${properties.ID}`, method: "DELETE" },
          { rel: "modify", href: `/properties/${properties.ID}`, method: "PUT" },
        ];
      });

      res.status(200).json({
        success: true,
        pagination: [{
          "total": properties.length,
          "pages": totalPages,
          "current": pageNumber,
          "limit": limitValue
        }],
        data: properties,
        links: [{ rel: "add-user", href: `/properties`, method: "POST" }],
      });
    } else {
      res.status(404).json({
        success: false,
        msg: "No property found."
      });
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

// Obtains information about specified property.
exports.findProperty = async (req, res) => {
  try {
    let property = await Property.findByPk(req.params.idT, {
      include: [
        {
          model: db.property_type,
          as: 'type_of_prop',
          attributes: ['type_name']
        },
        {
          model: db.photos_property,
          as: 'photos',
          attributes: ['photo']
        },
        {
          model: db.amenity,
          as: 'amenities',
          through: { attributes: [] }
        },
        {
          model: db.message,
          as: 'messages',
          attributes: ['content', 'receiver_username', 'sender_username']
        },
        {
          model: db.favorites,
          as: 'favorites',
          attributes: ['username']
        },
      ]
    });
    if (property === null) {
      return res.status(404).json({
        success: false,
        error: "Property not found",
        msg: "The specified properties ID does not exist.",
      });
    }

    return res.json({
      success: true,
      data: property,
      links: [
        {
          rel: "delete",
          href: `/properties/${property.ID}`,
          method: "DELETE",
        },
        {
          rel: "modify",
          href: `/properties/${property.ID}`,
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

// Handles the creation of a property ready for rental (authentication token must be provided in header).
exports.createProperty = async (req, res) => {
  try {
    if (req.loggedUserRole == 'owner') {
      let newProperty = await Property.create({
        owner_username: req.loggedUserId, property_type: req.body.property_type,
        title: req.body.title, description: req.body.description,
        location: req.body.location, map_url: req.body.map_url,
        daily_price: req.body.daily_price, guest_number: req.body.guest_number,
        bathrooms: req.body.bathrooms, bedrooms: req.body.bedrooms,
        beds: req.body.beds
      });

      res.status(201).json({
        success: true,
        msg: "Property created successfully.",
        property_ID: newProperty.ID,
        links: [
          { rel: "self", href: `/properties/${newProperty.ID}`, method: "GET" },
          { rel: "delete", href: `/properties/${newProperty.ID}`, method: "DELETE" },
          { rel: "modify", href: `/properties/${newProperty.ID}`, method: "PUT" }
        ],
      });
    } else {
      return res.status(403).json({
        success: false,
        msg: "You don't have permission to access this route."
      });
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        msg: error.errors.map((e) => e.message)
      });
    } else if (error instanceof Sequelize.ConnectionError) {
      res.status(503).json({
        error: "Database Error",
        success: false,
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      res.status(500).json({
        error: "Server Error",
        success: false,
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

exports.update = async (req, res) => {
  try {
    // Logic to update a property
    res
      .status(200)
      .json({ success: true, message: "Property updated successfully" });
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

// Handles deletion of a property the user owns (authentication token must be provided in header).
exports.deleteProperty = async (req, res) => {
  try {
    let property = await Property.findOne({ where: { ID: req.params.idT } });
    if (req.loggedUserId == property.owner_username || req.loggedUserRole == 'admin') {
      let deleteProperty = await Property.destroy({ where: { ID: req.params.idT } });
      if (deleteProperty == 1) {
        return res.json({
          success: true,
          msg: `Property deleted successfully.`,
        });
      } else {
        return res.status(404).json({
          success: false,
          error: "Property not found",
          msg: `The specified property ID does not exist.`,
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        msg: "You don’t have permission to access this route. You need to be the user who owns the property.",
      });
    }
  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      res.status(503).json({
        error: "Database Error",
        success: false,
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      res.status(500).json({
        error: "Server Error",
        success: false,
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

// Obtains all reviews about specified property.
exports.findReviews = async (req, res) => {
  try {
    const reservations = await db.reservation.findAll({
      attributes: ['property_ID', 'ID'],
      where: { property_ID: req.params.idT },
      raw: true
    });

    const reservationsFound = reservations.map(reservation => reservation.ID);

    const reviews = await db.review.findAll({
      attributes: ['username', 'rating', 'comment', 'reservation_ID'],
      where: { reservation_ID: reservationsFound },
      raw: true
    });

    let property = await Property.findByPk(req.params.idT);
    if (property === null) {
      return res.status(404).json({
        success: false,
        data: `Cannot find any property with ID ${req.params.idT}`,
      });
    }

    return res.json({
      success: true,
      data: reviews,
      links: [
        {
          rel: "create",
          href: `/property/${property.ID}/createReview`,
          method: "POST",
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

// Allows a user to create a review for a specified property.
exports.createReview = async (req, res) => {
  try {
    let property = await Property.findByPk(req.params.idT);
    if (!property) {
      return res.status(404).json({
        success: false,
        data: `Cannot find any property with ID ${req.params.idT}`,
      });
    }

    let reservation = await Reservation.findOne({
      where: {
        property_ID: req.params.idT,
        username: req.loggedUserId
      }
    });

    if (!reservation) {
      return res.status(403).json({
        success: false,
        msg: "You do not have a reservation for this property. You cannot leave a review."
      });
    }

    await Review.create({ 
      username: req.loggedUserId, rating: req.body.rating, 
      comment: req.body.comment, reservation_ID: reservation.ID});

    return res.json({
      success: true,
      msg: "Review created successfully.",
      links: [
        {
          rel: "get",
          href: `/properties/${req.params.idT}/reviews`,
          method: "GET",
        },
        {
          rel: "delete",
          href: `/properties/${req.params.idT}/reviews`,
          method: "DELETE",
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

exports.updateReview = async (req, res) => {
  try {
    // Logic to update a amenity
    res
      .status(200)
      .json({ success: true, message: "Review updated successfully" });
  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      res.status(503).json({
        error: "Database Error",
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
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
  }
};

// Handles deletion of a sent review (authentication token must be provided in header).
exports.deleteReview = async (req, res) => {
  try {
    const reservations = await db.reservation.findAll({
      attributes: ['property_ID', 'ID'],
      where: { property_ID: req.params.idT },
      raw: true
    });

    const reservationsFound = reservations.map(reservation => reservation.ID);

    const review = await db.review.findOne({ where: { reservation_ID: reservationsFound, ID: req.params.idR } });
    if (review) {
      if (req.loggedUserId == review.username || req.loggedUserRole == 'admin') {
        const deleteReview = await db.review.destroy({ where: { reservation_ID: reservationsFound, ID: req.params.idR } });

        if (deleteReview == 1) {
          return res.json({
            success: true,
            msg: "Review deleted successfully.",
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          msg: "You don't have permission to access this route."
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        error: "Review not found",
        msg: "The specified Review ID does not exist."
      });
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