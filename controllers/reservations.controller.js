const db = require("../models/index.js");
const Reservation = db.reservation;
const { ValidationError } = require('sequelize');
const Property = db.property
const Payment = db.payment;
const { Op } = require('sequelize');

// Only for programmers to analyze the changes made during testings
exports.findAll = async (req, res) => {
    try {
        const reservs = await Reservation.findAll({
            include: [
                {
                    model: db.status_reservation,
                    as: 'status',
                    attributes: ['status_name']
                },
                {
                    model: db.payment,
                    as: 'payments',
                    include: [{
                        model: db.status_payment,
                        as: 'status',
                        attributes: ['status_name']
                    }],
                }
            ],
            attributes: { exclude: ['status_reservation_ID',] },
            order: [['ID', 'DESC']]
        });  // TESTE
        res.status(200).json(reservs);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Obtains information about a specified reservation (authentication token must be provided in header).
exports.findOne = async (req, res) => {
    const username = req.params.username
    if (req.loggedUserId == username) {
        try {
            if (!parseInt(req.params.ID) || !req.params.ID) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid ID value",
                    msg: "ID must be an integer and is required"
                })
            }

            let reservation = await Reservation.findByPk(req.params.ID, {
                include: [
                    {
                        model: db.status_reservation,
                        as: 'status',
                        attributes: ['status_name']
                    },
                    {
                        model: db.review,
                        as: 'reviews',
                        attributes: ['comment']
                    },
                    {
                        model: db.payment,
                        as: 'payments',
                        attributes: ['amount']
                    },
                ]
            }
            )

            if (reservation === null) {
                return res.status(404).json({
                    success: false,
                    error: "Reservation Not Found",
                    msg: "The specified reservation ID does not exist."
                })
            }
            if (reservation.username != username) {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden",
                    msg: "You don’t have permission to access this route",
                });
            }
            else {
                return res.json({
                    success: true,
                    data: reservation,
                })
            }
        } catch (err) {
            res.status(500).json({
                success: false, msg: err.message || "An unexpected error occurred. Please try again later"
            })
        };
    }
    else {
        return res.status(403).json({
            success: false,
            error: "Forbidden",
            msg: "You don’t have permission to access this route",
        });
    }
};

exports.bodyValidator = async (req, res, next) => {
    try {
        if (isNaN(req.body.property_ID) || parseInt(req.body.property_ID) != req.body.property_ID) {
            return res.status(400).json({
                success: false,
                error: "Invalid ID value",
                msg: "Property ID must be an integer number"
            })
        }

        const property = await Property.findByPk(req.body.property_ID);
        if (!property) {
            return res.status(404).json({
                success: false,
                error: "Not Found",
                msg: `There is no property with the ID ${req.body.property_ID}`
            });
        }

        if (!req.body.property_ID || !req.body.dateIn || !req.body.dateOut || !req.body.total_price || !req.body.payment_type) {
            return res.status(400).json({
                success: false,
                error: "Missing required field",
                msg: "property_ID, dateIn, dateOut and payment_type and total_price are required"
            })
        }

        if (isNaN(req.body.total_price)) {
            return res.status(400).json({
                success: false,
                error: "Invalid Price value",
                msg: "Total Price must be a number"
            });
        }
        if (isNaN(req.body.payment_type) || !req.body.payment_type || parseInt(req.body.payment_type) != req.body.payment_type) {
            return res.status(400).json({
                success: false,
                error: "Invalid Payment Type value",
                msg: "Payment type is required must be an integer number"
            })
        }

        const pType = await db.payment_type.findByPk(req.body.payment_type);
        if (!pType) {
            return res.status(404).json({
                success: false,
                error: "Payment Type Not Found",
                msg: `There is no payment type with the ID ${req.body.payment_type}`
            });
        }

        let today = new Date()
        const dateInB = new Date(req.body.dateIn);
        const dateOutB = new Date(req.body.dateOut)
        if (dateInB < today || dateOutB <= today) {
            return res.status(400).json({
                success: false,
                error: "Invalid date",
                msg: `You can only make reservations for future days`
            });
        }

        const existingReservations = await Reservation.findAll({
            where: {
                property_ID: req.body.property_ID,
                [Op.or]: [
                    {
                        dateIn: {
                            [Op.between]: [dateInB, dateOutB]
                        }
                    },
                    {
                        dateOut: {
                            [Op.between]: [dateInB, dateOutB]
                        }
                    },
                    {
                        [Op.and]: [
                            {
                                dateIn: {
                                    [Op.lte]: dateInB
                                }
                            },
                            {
                                dateOut: {
                                    [Op.gte]: dateOutB
                                }
                            }
                        ]
                    },
                    {
                        [Op.and]: [
                            {
                                dateIn: {
                                    [Op.gte]: dateInB
                                }
                            },
                            {
                                dateOut: {
                                    [Op.lte]: dateOutB
                                }
                            }
                        ]
                    }
                ], 
                status_reservation_ID: {
                    [Op.in]: [1, 3]
                }
            }
        })
        console.log(existingReservations)
        if (existingReservations.length > 0) {
            return res.status(400).json({
                success: false,
                error: "Property already booked",
                msg: "You cant proceed with the reservation because there is already a reservation during the chosen dates."
            });
        }

        next()
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: "Server error",
            msg: "An unexpected error occurred. Please try again later"
        });
    }

};

// Handles user reservation by sending a request of reservation to the owner (authentication token must be provided in header).
exports.create = async (req, res) => {
    // if (req.loggedUserId) {
        const t = await db.sequelize.transaction();

        try {
            const newReservation = await Reservation.create({
                property_ID: req.body.property_ID,
                // username: req.loggedUserId,
                username: req.body.username,
                status_reservation_ID: 1,
                dateIn: req.body.dateIn,
                dateOut: req.body.dateOut,
                total_price: req.body.total_price,
                payment_type: req.body.payment_type,
            }, { transaction: t });

            const newPayment = await Payment.create({
                reservation_ID: newReservation.ID,
                status_payment: 1, // 1 é o ID para "pending"
                amount: req.body.total_price,
                payment_type: req.body.payment_type
            }, { transaction: t });

            await t.commit(); // Commit da transação se tudo estiver correto

            let reservation = await Reservation.findByPk(newReservation.ID, {
                include: [
                    {
                        model: db.status_reservation,
                        as: 'status',
                        attributes: ['status_name']
                    },
                    {
                        model: db.payment,
                        as: 'payments',
                        include: [{
                            model: db.status_payment,
                            as: 'status',
                            attributes: ['status_name']
                        }],
                    }
                ]
            })

            return res.status(201).json({
                success: true,
                msg: "Reservation created successfully.",
                data: {
                    reservation: reservation
                }
            });
        } catch (err) {
            await t.rollback(); // Rollback da transação em caso de erro

            if (err instanceof ValidationError) {
                return res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    msg: err.message
                });
            } else {
                return res.status(500).json({
                    success: false,
                    error: "Server error",
                    msg: err.message || "An unexpected error occurred. Please try again later"
                });
            }
        }
    // }
    // else {
    //     return res.status(403).json({
    //         success: false,
    //         error: "Forbidden",
    //         msg: "You must be logged in to rent a property.",
    //     });
    // }
};

// Handles owner of property confirmation or cancelation of reservation order (authentication token must be provided in header). 
exports.changeStatus = async (req, res) => {
    const reservationId = req.params.ID;
    const newStatusName = req.body.status_name;
    const reservation = await Reservation.findByPk(reservationId);

    if (!reservation) {
        return res.status(404).json({
            success: false,
            error: "Reservation Not Found",
            msg: "The specified reservation ID does not exist."
        });
    }

    if (req.loggedUserId == reservation.username) {
        try {
            const status = await db.status_reservation.findOne({ where: { status_name: newStatusName } });
            if (!status) {
                return res.status(404).json({
                    success: false,
                    error: "Missing required fields",
                    msg: "Status can only be pending cancelled or booked"
                });
            }

            reservation.status_reservation_ID = status.ID;
            await reservation.save();

            const updatedReservation = await Reservation.findByPk(reservationId, {
                include: [
                    {
                        model: db.status_reservation,
                        as: 'status',
                        attributes: ['status_name']
                    }
                ]
            });

            res.status(200).json({
                success: true,
                msg: 'Reservation updated successfully.',
                data: updatedReservation
            });
        } catch (err) {
            if (err instanceof ValidationError) {
                return res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    msg: err.message
                });
            } else {
                return res.status(500).json({
                    success: false,
                    error: "Internal server error",
                    msg: err.message || "Some error occurred while creating the reservation and payment."
                });
            }
        }
    }
    else {
        return res.status(403).json({
            success: false,
            error: "Forbidden",
            msg: "You don’t have permission to access this route. You need to be the guest or owner of the property."
        });
    }
};

// Handles cancelation of reservation. A reservation can only be canceled if there is more than 3 days until date in (authentication token must be provided in header). 
exports.deleteReservation = async (req, res) => {
    const reservationId = req.params.ID;
    const reservation = await Reservation.findByPk(reservationId);

    if (!reservation) {
        return res.status(404).json({
            success: false,
            error: "Reservation Not Found",
            msg: "The specified reservation ID does not exist."
        });
    }
    const property = await Property.findOne({ where: { ID: reservation.property_ID } })

    if (!property) {
        return res.status(404).json({
            success: false,
            error: "Property Not Found",
            msg: "The specified property ID does not exist."
        });
    }

    if (req.loggedUserId == reservation.username || req.loggedUserId == property.owner_username) {
        try {
            const dateIn = new Date(reservation.dateIn);
            const currentDate = new Date();
            const diffTime = Math.abs(dateIn - currentDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 3) {
                return res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    msg: 'Reservation can only be canceled if there is more than 3 days until date in.'
                });
            }

            if (dateIn < currentDate) {
                return res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    msg: 'This reservation has already passed, cannot be deleted'
                });
            }

            await reservation.destroy();
            return res.status(200).json({
                success: true,
                msg: 'Reservation deleted successfully.'
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: "Server Error",
                msg: err.message || 'An unexpected error occurred. Please try again later'
            });
        }
    }
    else {
        return res.status(403).json({
            success: false,
            error: "Forbidden",
            msg: "You don’t have permission to access this route. You need to be the user who booked or the owner of the property",
        });
    }
};

// Obtains general information about all the logged user reservations (authentication token must be provided in header). 
exports.getUserReservations = async (req, res) => {

    const username = req.params.username
    if (req.loggedUserId == username) {
        try {
            const { page = 1, limit = 10, sort = 'DESC' } = req.query;
            const offset = (page - 1) * limit;

            if (req.query.sort) {
                if (req.query.sort != "ASC" && req.query.sort != "DESC") {
                    return res.status(400).json({
                        success: false,
                        error: "Invalid sort values",
                        msg: "Sort can only be ‘desc’ or ‘asc’."
                    });
                }
            }

            if (req.query.limit) {
                if (isNaN(req.query.limit) || !parseInt(limit)) {
                    return res.status(400).json({
                        success: false,
                        error: "Invalid limit values",
                        msg: `Limit must be an integer number`
                    });
                }
            }

            if (req.query.page) {
                if (isNaN(req.query.page) || !parseInt(page)) {
                    return res.status(400).json({
                        success: false,
                        error: "Invalid page values",
                        msg: `Page must be an integer number`
                    });
                }
            }

            const reservations = await Reservation.findAndCountAll({
                where: { username },
                limit: parseInt(limit),
                offset: offset,
                order: [['dateIn', sort]],
                include: [
                    {
                        model: db.status_reservation,
                        as: 'status',
                        attributes: ['status_name']
                    }
                ]
            });

            return res.status(200).json({
                success: true,
                data: reservations.rows,
                pagination: {
                    total: reservations.count,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
                msg: err.message || 'An unexpected error occurred. Please try again later'
            });
        }
    } else {
        return res.status(403).json({
            success: false,
            error: "Forbidden",
            msg: "You don’t have permission to access this route.",
        });
    }
};
