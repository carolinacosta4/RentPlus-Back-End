// propertyController.js
const db = require("../models/index.js");
const Property = db.property;
const Review = db.review;

const { Op, ValidationError, Sequelize } = require("sequelize");

// Obtains general information about all properties. Can be filtered by properties type.
exports.findAll = async (req, res) => {
  let { type, page, limit } = req.query;

  const condition = type ? { property_type: { [Op.like]: `%${type}%` } } : null;
  const pageNumber = page && Number.parseInt(page) > 0 ? Number.parseInt(page) : 1;
  const limitValue = limit && Number.parseInt(limit) > 0 ? Number.parseInt(limit) : 10;
  const offset = (pageNumber - 1) * limitValue;

  try {
    const properties = await Property.findAll({
      where: condition, limit: limitValue, offset: offset, raw: true,
      include: [
        {
          model: db.property_type,
          attributes: ['type_name']
        },
        {
          model: db.photos_property,
        },
      ]
    });
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
          attributes: ['type_name']
        },
        {
          model: db.photos_property,
          attributes: ['photo']
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
    let newProperty = await Property.create(req.body);
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
    let deleteProperty = await Property.destroy({ where: { ID: req.params.idT } });
    if (deleteProperty == 1) {
      return res.json({
        success: true,
        msg: `Property deleted successfully.`,
      });
    }

    return res.status(404).json({
      success: false,
      error: "Property not found",
      msg: `The specified property ID does not exist.`,
    });
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
    let review = await Review.findByPk(req.params.idT);
    if (review === null) {
      return res.status(404).json({
        success: false,
        data: `Cannot find any review with ID ${req.params.idT}`,
      });
    }

    return res.json({
      success: true,
      data: review,
      links: [
        {
          rel: "delete",
          href: `/reviews/${review.ID}`,
          method: "DELETE",
        },
        {
          rel: "modify",
          href: `/reviews/${review.ID}`,
          method: "PUT",
        },
      ],
    });
  } catch (err) {
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

exports.createReview = async (req, res) => {
  try {
    let newReview = await Review.create(req.body);
    res.status(201).json({
      success: true,
      msg: "Review created successfully.",
      review_ID: newReview.ID,
      links: [
        { rel: "self", href: `/properties/${req.params.idT}/reviews/${newReview.ID}`, method: "GET" },
        { rel: "delete", href: `/properties/${req.params.idT}/reviews/${newReview.ID}`, method: "DELETE" },
        { rel: "modify", href: `/properties/${req.params.idT}/reviews/${newReview.ID}`, method: "PUT" }
      ],
    });
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
    // Logic to delete a amenity
    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
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