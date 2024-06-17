const db = require("../models/index.js");
const Payment = db.payment;
const { ValidationError } = require('sequelize');
const Reservation = db.reservation
const Property = db.property

// Only for programmers to analyze the changes made during testings
exports.findAll = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            include: [
                {
                    model: db.status_payment,
                    as: 'status',
                    attributes: ['status_name']
                },
                {
                    model: db.payment_type,
                    as: 'type',
                    attributes: ['type']
                }], order: [["ID", 'DESC']]
        });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Create a payment automatically with the creation of a reservation
exports.create = async (req, res) => {
    try {
        const { payment_type } = req.body;

        const lastPayment = await Payment.findOne({
            order: [['reservation_ID', 'DESC']],
        });

        let reservation_ID = 1;
        if (lastPayment) {
            reservation_ID = lastPayment.reservation_ID;
        }

        if (!reservation_ID || !payment_type) {
            return res.status(400).json({
                error: "Some information are missing"
            });
        }

        const newPayment = await Payment.create({
            reservation_ID,
            status_payment: 1,
            amount: req.body.total_price,
            payment_type,
        });
        // 1 is the ID of status "pending"

        return res.status(201).json({
            success: true,
            msg: "Payment successfully created with status 'pending'.",
            data: newPayment
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        } else {
            res.status(500).json({
                success: false,
                msg: err.message || "Some error occurred while creating the payment."
            });
        }
    }
};

// Access specific payment.
exports.findOne = async (req, res) => {
    try {
        if (!parseInt(req.params.ID)) {
            return res.status(400).json({
                success: false,
                error: "Invalid ID value",
                error: "ID must be an integer"
            })
        }

        let payment = await Payment.findByPk(req.params.ID, {
            include: [
                {
                    model: db.status_payment,
                    as: 'status',
                    attributes: ['status_name']
                },
                {
                    model: db.payment_type,
                    as: 'type',
                    attributes: ['type']
                },
            ]
        })

        if (!payment) {
            return res.status(404).json({
                success: false,
                error: "Payment not found",
                msg: "The specified payment ID does not exist"
            })
        }

        let reserv = await Reservation.findByPk(payment.reservation_ID)
        let prop = await Property.findByPk(reserv.property_ID)
        let guestReservation = reserv.username

        if (req.loggedUserId == guestReservation || req.loggedUserId == prop.owner_username || req.loggedUserRole != "admin") {
            return res.json({
                success: true,
                data: payment,
                links: [
                    { "rel": "modify", "href": `/payments/${payment.ID}`, "method": "POST" }
                ]
            })

        } else {
            return res.status(403).json({
                success: false,
                error: "Forbidden",
                msg: "You don’t have permission to access this route.",
            });
        }


    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "An unexpected error occurred. Please try again later"
        })
    };
};

// Handles payment status of a specific reservation
exports.changeStatus = async (req, res) => {
    try {
        const reservationId = req.params.ID;
        const newStatusName = req.body.status_name;

        const reservation = await Reservation.findByPk(reservationId)
        if (!reservation) {
            return res.status(404).json({
                success: false,
                error: "Reservation not found",
                msg: "The specified reservation ID does not exist"
            });
        }

        let property = await Property.findByPk(reservation.property_ID)
        if (req.loggedUserId == reservation.username || req.loggedUserId == property.owner_username || req.loggedUserRole == "admin") {
            const payment = await Payment.findOne({ where: { reservation_ID: reservationId } });

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    error: "Payment not found",
                    msg: `There is no payment related to the specified reservation`
                });
            }

            const status = await db.status_payment.findOne({ where: { status_name: newStatusName } });
            if (!status) {
                return res.status(404).json({
                    success: false,
                    error: "Status not found",
                    msg: "The specified status does not exist"
                });
            }

            payment.status_payment = status.ID;
            await payment.save();

            return res.status(200).json({
                success: true,
                msg: "Payment was updated successfully",
            });
        }
        else {
            return res.status(403).json({
                success: false,
                error: "Forbidden",
                msg: "You don’t have permission to access this route. You need to be the owner or the guest of the property",
            });
        }

    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        } else {
            res.status(500).json({
                success: false,
                msg: err.message || "An unexpected error occurred. Please try again later"
            });
        }
    }
};