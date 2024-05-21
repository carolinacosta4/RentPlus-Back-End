const db = require("../models/index.js");
const Reservation = db.reservation;
const { ValidationError } = require('sequelize');
const Property = db.property
const Payment = db.payment;

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
            order: [['ID', 'ASC']]
        });  // TESTE
        res.status(200).json(reservs);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Obtains information about a specified booking (authentication token must be provided in header).
exports.findOne = async (req, res) => { 
    const username = req.params.username
    if (req.loggedUserId == username) {
        try {
            if (!parseInt(req.params.ID) || !req.params.ID) {
                return res.status(400).json({
                    error: "ID must be an integer and is required"
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
                    msg: `Can't find any reservation with id ${req.params.ID}`
                })
            }
            if (reservation.username != username) {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden",
                    msg: "You don’t have permission to see information about this reservation. You can only see your own reservations",
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
                success: false, msg: err.message || "Some error occurred while finding the payment."
            })
        };
    }
    else {
        return res.status(403).json({
            success: false,
            error: "Forbidden",
            msg: "You don’t have permission to see information about this reservation. You can only see your own reservations",
        });
    }
};

exports.bodyValidator = async (req, res, next) => {
    try {
        const property = await Property.findByPk(req.body.property_ID);
        if (!property) {
            return res.status(404).json({
                error: `There is no property with the ID ${req.body.property_ID}`
            });
        }

        if (!req.body.property_ID || !req.body.dateIn || !req.body.dateOut || !req.body.total_price || !req.body.payment_type) {
            return res.status(400).json({
                error: "Some required information are missing"
            })
        }
        if (isNaN(req.body.property_ID) || parseInt(req.body.property_ID) != req.body.property_ID) {
            return res.status(400).json({
                error: "Property ID must be an integer number"
            })
        }

        if (isNaN(req.body.total_price)) {
            return res.status(400).json({
                error: "Total Price must be a number"
            });
        }
        if (isNaN(req.body.payment_type) || !req.body.payment_type || parseInt(req.body.payment_type) != req.body.payment_type) {
            return res.status(400).json({
                error: "Payment type is required must be an integer number"
            })
        }

        const pType = await db.payment_type.findByPk(req.body.payment_type);
        if (!pType) {
            return res.status(404).json({
                error: `There is no payment type with the ID ${req.body.payment_type}`
            });
        }
        next()
    }
    catch (err) {
        res.status(500).json({
            error: "Internal server error"
        });
    }

};

// Handles user booking by sending a request of booking to the owner (authentication token must be provided in header).
exports.create = async (req, res) => {
    if (req.loggedUserId) {
        const t = await db.sequelize.transaction();

        try {
            const newReservation = await Reservation.create({
                property_ID: req.body.property_ID,
                username: req.loggedUserId,
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
                msg: "Reservation and payment successfully created with status 'pending'.",
                data: {
                    reservation: reservation
                }
            });
        } catch (err) {
            await t.rollback(); // Rollback da transação em caso de erro

            if (err instanceof ValidationError) {
                return res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
            } else {
                return res.status(500).json({
                    success: false,
                    msg: err.message || "Some error occurred while creating the reservation and payment."
                });
            }
        }
    }
    else {
        return res.status(403).json({
            success: false,
            error: "Forbidden",
            msg: "You must be logged in to rent a property.",
        });
    }
};

// Handles owner of property confirmation or cancelation of booking order (authentication token must be provided in header). 
exports.changeStatus = async (req, res) => {
    const reservationId = req.params.ID;
    const newStatusName = req.body.status_name;
    const reservation = await Reservation.findByPk(reservationId);

    if (!reservation) {
        return res.status(404).json({
            success: false,
            msg: `There is no reservation with the ID ${reservationId}`
        });
    }

    if (req.loggedUserId == reservation.username) {
        try {
            const status = await db.status_reservation.findOne({ where: { status_name: newStatusName } });
            if (!status) {
                return res.status(400).json({
                    success: false,
                    msg: `There is no status with the name ${newStatusName}`
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
                msg: 'Reservation status successfully updated.',
                data: updatedReservation
            });
        } catch (err) {
            if (err instanceof ValidationError) {
                res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
            } else {
                res.status(500).json({
                    success: false,
                    msg: err.message || "Some error occurred while updating the status."
                });
            }
        }
    }
    else {
        return res.status(403).json({
            success: false,
            error: "Forbidden",
            msg: "You don’t have permission to change the status of this reservation. Only the property owners can do it.",
        });
    }
};

// Handles cancelation of booking. A booking can only be canceled if there is more than 3 days until date in (authentication token must be provided in header). 
exports.deleteReservation = async (req, res) => {
    const reservationId = req.params.ID;
    const reservation = await Reservation.findByPk(reservationId);
    
    if (!reservation) {
        return res.status(404).json({
            success: false,
            msg: `Can't find any reservation with id ${reservationId}`
        });
    }
    const property = await Property.findOne({where: {ID: reservation.property_ID}})

    if (!property) {
        return res.status(404).json({
            success: false,
            msg: `Can't find any properties with id ${reservation.property_ID}`
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
                    msg: 'Reservation can only be canceled if there is more than 3 days until date in.'
                });
            }

            if (dateIn < currentDate) {
                return res.status(400).json({
                    success: false,
                    msg: 'This reservation has already passed, cannot be deleted'
                });
            }

            await reservation.destroy();
            return res.status(200).json({
                success: true,
                msg: 'Reservation successfully deleted.'
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                msg: err.message || 'Some error occurred while canceling the reservation.'
            });
        }
    }
    else {
        return res.status(403).json({
            success: false,
            error: "Forbidden",
            msg: "You don’t have permission to delete this reservation",
        });
    }
};

// Obtains general information about all the logged user reservations (authentication token must be provided in header). 
exports.getUserReservations = async (req, res) => {
    
    const username = req.params.username
    if (req.loggedUserId == username) {
        try {
            const { page = 1, limit = 10, sort = 'dateIn' } = req.query;
            const offset = (page - 1) * limit;

            const reservations = await Reservation.findAndCountAll({
                where: { username },
                limit: parseInt(limit),
                offset: offset,
                order: [[sort, 'ASC']]
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
                msg: err.message || 'Some error occurred while retrieving the reservations'
            });
        }
    } else {
        return res.status(403).json({
            success: false,
            error: "Forbidden",
            msg: "You don’t have permission to see information about this user.",
        });
    }
};
