const db = require("../models/index.js");
const Property = db.property;
const Review = db.review;
const Reservation = db.reservation
const Photo = db.photos_property
const config = require("../config/db.config.js");
const { Op, ValidationError, Sequelize } = require("sequelize");

const cloudinary = require("cloudinary").v2;
// cloudinary configuration
cloudinary.config({
  cloud_name: config.C_CLOUD_NAME,
  api_key: config.C_API_KEY,
  api_secret: config.C_API_SECRET
});

// Obtains general information about all properties. Can be filtered by properties type.
exports.findAll = async (req, res) => {
  let { type, page, limit } = req.query;

  const pageNumber = page && Number.parseInt(page) > 0 ? Number.parseInt(page) : 1;
  const limitValue = limit && Number.parseInt(limit) > 0 ? Number.parseInt(limit) : null;
  const offset = (pageNumber - 1) * limitValue;

  try {
    if (type != undefined) {
      const propertyTypes = await db.property_type.findAll({
        attributes: ['type_name'],
        raw: true
      });

      const types = propertyTypes.map(type => type.type_name.toLowerCase());

      if (type && !types.includes(type.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: "Invalid type values",
          message: `Type can only be one of the following: ${types.join(', ')}`
        });
      }
    }

    const typeCondition = type ? { type_name: { [Op.like]: type } } : null;
    const allProperty = await Property.findAll()

    const properties = await Property.findAll({
      limit: limitValue, offset: offset, raw: true,
      include: [
        {
          model: db.property_type,
          as: 'type_of_prop',
          where: typeCondition,
          attributes: ['type_name']
        },
      ]
    });

    for (let property of properties) {
      let photo = await Photo.findOne({ where: { property_ID: property.ID } })
      property.photo = photo.dataValues.photo
    }

    if (properties.length > 0) {
      properties.forEach((property) => {
        property.links = [
          { rel: "self", href: `/properties/${properties.ID}`, method: "GET" },
          { rel: "delete", href: `/properties/${properties.ID}`, method: "DELETE" },
          { rel: "modify", href: `/properties/${properties.ID}`, method: "PUT" },
        ];
      });

      let total = Math.ceil(allProperty.length / limitValue) || null

      return res.status(200).json({
        success: true,
        pagination: [{
          "total": allProperty.length,
          "current": pageNumber,
          "limit": limitValue,
          "totalPages": total
        }],
        data: properties,
        links: [{ rel: "add-user", href: `/properties`, method: "POST" }],
      });
    } else {
      return res.status(404).json({
        success: false,
        msg: "No property found."
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

// Obtains information about specified property.
exports.findProperty = async (req, res) => {
  try {
    let property = await Property.findByPk(req.params.idP, {
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

// Handles the creation of a property ready for rental (authentication token must be provided in header).
exports.createProperty = async (req, res) => {
  try {
    if (req.loggedUserRole == 'owner') {
      const createdAt = new Date();

      let newProperty = await Property.create({
        owner_username: req.loggedUserId,
        property_type: req.body.property_type,
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        map_url: req.body.map_url,
        daily_price: req.body.daily_price,
        guest_number: req.body.guest_number,
        bathrooms: req.body.bathrooms,
        bedrooms: req.body.bedrooms,
        beds: req.body.beds,
        created_at: createdAt,
      });

      if (req.files) {
        for (let file of req.files.inputPropertyImages) {
          const b64 = Buffer.from(file.buffer).toString("base64");
          let dataURI = `data:${file.mimetype};base64,${b64}`;
          let result = await cloudinary.uploader.upload(dataURI, { resource_type: "auto" });
          await Photo.create({
            property_ID: newProperty.ID,
            photo: result ? result.url : null,
            cloudinary_id: result ? result.public_id : null
          });
        }
      }

      if (req.body.amenities && req.body.amenities.length > 0) {
        for (let amenity of req.body.amenities.split(',')) {
          await newProperty.addAmenities(amenity)
        }
      }

      return res.status(201).json({
        success: true,
        msg: "Property created successfully.",
        property_ID: newProperty.ID,
        data: newProperty,
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
      return res.status(400).json({
        success: false,
        msg: error.errors.map((e) => e.message)
      });
    } else if (error instanceof Sequelize.ConnectionError) {
      return res.status(503).json({
        error: "Database Error",
        success: false,
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        error: "Server Error",
        success: false,
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

// Allows user to edit their property.
exports.editProperty = async (req, res) => {
  let affectedRows
  try {
    let property = await Property.findByPk(req.params.idP);
    if (property === null) {
      return res.status(404).json({
        success: false,
        msg: "The specified property ID does not exist",
      });
    }

    if (req.loggedUserId == property.owner_username) {
      if (!req.body || Object.keys(req.body).length == 0) {
        return res.status(400).json({
          success: false,
          msg: "At least one field must be provided to update.",
        });
      } else if (!req.body.title & !req.body.description & !req.body.location & !req.body.map_url & !req.body.daily_price & !req.body.guest_number & !req.body.bathrooms & !req.body.bedrooms & !req.body.beds & !req.body.photos & !req.body.amenities) {
        return res.status(400).json({
          success: false,
          msg: "You can only edit the title, description, location, URL of the map, daily price, number of guests, number of bathrooms, number of bedrooms, number of beds, amenities or photos.",
        });
      }

      affectedRows = await Property.update(req.body, {
        where: { ID: req.params.idP },
      });

      if (req.files.inputPropertyImages) {
        await Photo.destroy({ where: { property_ID: property.ID } })
        for (let file of req.files.inputPropertyImages) {
          const b64 = Buffer.from(file.buffer).toString("base64");
          let dataURI = `data:${file.mimetype};base64,${b64}`;
          let result = await cloudinary.uploader.upload(dataURI, { resource_type: "auto" });
          await Photo.create({
            property_ID: property.ID,
            photo: result ? result.url : null,
            cloudinary_id: result ? result.public_id : null
          });
        }
      }

      if (req.body.amenities) {
        const amenities = req.body.amenities.split(',');
        await property.setAmenities(amenities);
      }

      if (affectedRows[0] === 0) {
        return res.status(200).json({
          success: true,
          msg: `No updates were made on property with ID ${req.params.idP}.`,
        });
      }

      return res.status(200).json({
        success: true,
        data: property,
      
        msg: `Property with ID ${req.params.idP} was updated successfully.`,
      });

    }

    return res.status(403).json({
      success: false,
      error: "Forbidden",
      msg: "You don't have permission to access this route. You need to be the user who owns the property.",
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

// Handles deletion of a property the user owns (authentication token must be provided in header).
exports.deleteProperty = async (req, res) => {
  try {
    let property = await Property.findOne({ where: { ID: req.params.idP } });
    if (!property) {
      return res.status(404).json({
        success: false,
        error: "Property not found",
        msg: `The specified property ID does not exist.`,
      });
    }

    let dates = 0
    const currentDate = new Date();
    let reservationProperty = await Reservation.findAll({ where: { property_ID: req.params.idP } })
    reservationProperty.forEach((resProp) => {
      const dateIn = new Date(resProp.dateIn);
      if (dateIn > currentDate) {
        dates += 1
      }
    });

    if (req.loggedUserId == property.owner_username || req.loggedUserRole == 'admin') {
      if (dates == 0) {
        await Property.destroy({ where: { ID: req.params.idP } });
        return res.json({
          success: true,
          msg: `Property deleted successfully.`,
        });
      } else {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          msg: "You have reservations arranged wait for them to end to delete the building.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        msg: "You don't have permission to access this route. You need to be the user who owns the property.",
      });
    }
  } catch (error) {
    if (error instanceof Sequelize.ConnectionError) {
      return res.status(503).json({
        error: "Database Error",
        success: false,
        msg: "There was an issue connecting to the database. Please try again later"
      });
    } else {
      return res.status(500).json({
        error: "Server Error",
        success: false,
        msg: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

// Obtains all reviews about specified property.
exports.findReviews = async (req, res) => {
  let { page, limit } = req.query;

  const pageNumber = page && Number.parseInt(page) > 0 ? Number.parseInt(page) : 1;
  const limitValue = limit && Number.parseInt(limit) > 0 ? Number.parseInt(limit) : 10;
  const offset = (pageNumber - 1) * limitValue;

  try {
    let property = await Property.findByPk(req.params.idP);
    if (property === null) {
      return res.status(404).json({
        success: false,
        data: `Cannot find any property with ID ${req.params.idP}`,
      });
    }

    const reservations = await db.reservation.findAll({
      attributes: ['property_ID', 'ID'],
      where: { property_ID: req.params.idP },
      raw: true
    });

    const reservationsFound = reservations.map(reservation => reservation.ID);

    const reviews = await db.review.findAll({
      attributes: ['username', 'rating', 'comment', 'reservation_ID'],
      where: { reservation_ID: reservationsFound },
      include: [
        {
          model: db.user,
          as: "userReview",
          attributes: ['profile_image']
        }
      ],
      limit: limitValue, offset: offset,
      raw: true
    });

    if (reviews.length > 0) {
      const reviewsNotFiltered = await db.review.findAll({
        where: { reservation_ID: reservationsFound },
        raw: true
      });

      return res.json({
        success: true,
        pagination: [{
          "total": reviews.length,
          "current": pageNumber,
          "limit": limitValue
        }],
        data: reviews,
        links: [
          {
            rel: "create",
            href: `/property/${property.ID}/createReview`,
            method: "POST",
          },
        ],
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

// Allows a user to create a review for a specified property.
exports.createReview = async (req, res) => {
  try {
    let property = await Property.findByPk(req.params.idP);
    if (!property) {
      return res.status(404).json({
        success: false,
        data: `Cannot find any property with ID ${req.params.idP}`,
      });
    }

    if (!req.body.rating || !req.body.reservation_ID) {
      return res.status(400).json({
        success: false,
        msg: "Reservation_ID and rating are required."
      });
    }

    let reservation = await Reservation.findOne({
      where: {
        property_ID: req.params.idP,
        username: req.loggedUserId,
        ID: req.body.reservation_ID
      }
    });

    if (!reservation) {
      return res.status(403).json({
        success: false,
        msg: "You do not have a reservation for this property. You cannot leave a review."
      });
    }

    let review = await Review.findOne({ where: { reservation_ID: req.body.reservation_ID } })

    if (review) {
      return res.status(400).json({
        success: false,
        msg: "You already added a review to this reservation.",
      });
    }

    let newReview = await Review.create({
      username: req.loggedUserId, rating: req.body.rating,
      comment: req.body.comment, reservation_ID: req.body.reservation_ID
    });

    return res.json({
      success: true,
      msg: "Review created successfully.",
      data: newReview,
      links: [
        {
          rel: "get",
          href: `/properties/${req.params.idP}/reviews`,
          method: "GET",
        },
        {
          rel: "delete",
          href: `/properties/${req.params.idP}/reviews`,
          method: "DELETE",
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

// Handles deletion of a sent review (authentication token must be provided in header).
exports.deleteReview = async (req, res) => {
  try {
    const reservations = await db.reservation.findAll({
      attributes: ['property_ID', 'ID'],
      where: { property_ID: req.params.idP },
      raw: true
    });

    let property = await Property.findOne({ where: { ID: req.params.idP } })

    if (!property) {
      return res.status(404).json({
        success: false,
        error: "Property not found",
        msg: "The specified Property ID does not exist."
      });
    }

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

// Handles property blocking.
exports.editBlock = async (req, res) => {
  try {
    let msg
    let property = await Property.findByPk(req.params.idP);
    if (property === null) {
      return res.status(404).json({
        success: false,
        msg: `Cannot find any property with ID ${req.params.idP}`,
      });
    }

    await Property.update({ is_blocked: !property.is_blocked }, {
      where: { ID: req.params.idP },
    });

    let updatedProperty = await Property.findByPk(req.params.idP);

    if (updatedProperty.is_blocked) {
      msg = `Property with ID ${req.params.idP} was blocked.`
    } else {
      msg = `Property with ID ${req.params.idP} was unblocked.`
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
        msg: `Error updating property with ID ${req.params.idP}.`,
      });
    }
  }
};