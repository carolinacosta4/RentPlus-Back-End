const db = require("../models/index.js");
const Reservation = db.reservation;
const ReservationStatus = db.status_reservation;
const { ValidationError } = require('sequelize');
const Property = db.property

exports.findAll = async (req, res) => {
    try {
      const reservs = await Reservation.findAll({ include: [
        {
          model: db.status_reservation,
          as: 'status',
          attributes: ['status_name']
        },
    ], 
    attributes: { exclude: ['status_reservation_ID'] }});  // TESTE
      res.status(200).json(reservs);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
};

exports.findOne = async (req, res) => {
    try {
        if (!parseInt(req.params.ID)) {
                return res.status(400).json({
                    error: "ID must be an integer"
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
            ]}
            )

        if (reservation === null) {
            return res.status(404).json({
                success: false,
                msg: `Can't find any reservation with id ${req.params.ID}`
            })
        }
        else {
            return res.json({
                success: true,
                data: reservation,
                links: [
                    { "rel": "modify", "href": `/reservations/${reservation.ID}`, "method": "POST" }
                ]
            })
        }
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Some error occurred while finding the payment."})
    };
};

exports.bodyValidator = async (req, res, next) => {
    try{
        const property = await Property.findByPk(req.body.property_ID);
        if (!property) {
            return res.status(400).json({
                error: `There is no property with the ID ${req.body.property_ID}`
            });
        }
    
    if (!req.body.property_ID || !req.body.username  || !req.body.status_reservation_ID  || !req.body.dateIn  || !req.body.dateOut  || !req.body.total_price) {
            return res.status(400).json({
                error: "Some required information are missing"
            })
        }
        if (isNaN(req.body.property_ID) || parseInt(req.body.property_ID) != req.body.property_ID){
            return res.status(400).json({
                error: "Property ID must be an integer number"
            })
        }
        if (isNaN(req.body.status_reservation_ID) || parseInt(req.body.status_reservation_ID) != req.body.status_reservation_ID) {
            return res.status(400).json({
                error: "Status Reservation ID must be an integer number"
            });
        }
    
        if (isNaN(req.body.total_price)) {
            return res.status(400).json({
                error: "Total Price must be a number"
            });
        }
        next()
    }
    catch(err){
        res.status(500).json({
            error: "Internal server error"
        });
    }
    
    };



exports.create = async (req, res) => {
    try {
        let newReservation = await Reservation.create(req.body);
        // return success message with ID
        res.status(201).json({
            success: true,
            msg: "Reservation successfully created.",
            links: [
                { "rel": "self", "href": `/reservations/${newReservation.ID}`, "method": "GET" },
                { "rel": "delete", "href": `/reservations/${newReservation.ID}`, "method": "DELETE" }
            ]
        });
    }
    catch (err) {
        if (err instanceof ValidationError)
            res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        else
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while creating the reservation."
            });
    };
};

// TERMINAR ISSO AQUI
exports.changeStatus = async (req, res) => {
    try {
        const reservationId = req.params.ID;
        const newStatusName = req.body.status_name;

        // Verifica se a reserva existe
        const reservation = await Reservation.findByPk(reservationId);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                msg: `There is no reservation with the ID ${reservationId}`
            });
        }

        // Verifica se o novo status existe pelo nome
        const status = await db.status_reservation.findOne({ where: { status_name: newStatusName } });
        if (!status) {
            return res.status(400).json({
                success: false,
                msg: `There is no status with the name ${newStatusName}`
            });
        }

        // Atualiza o status da reserva
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
};


exports.deleteReservation = async (req, res) => {
    try {
        const reservationId = req.params.ID;
        const reservation = await Reservation.findByPk(reservationId);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                msg: `Can't find any reservation with id ${reservationId}`
            });
        }

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

        if(dateIn < currentDate){
            return res.status(400).json({
                success: false,
                msg: 'This reservation has already passed, cannot be deleted'
            });
        }

        await reservation.destroy();
        return res.status(200).json({
            success: true,
            msg: 'Reservation successfully canceled.'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: err.message || 'Some error occurred while canceling the reservation.'
        });
    }
};

exports.getUserReservations = async (req, res) => {
    try {
        // const username = req.user.username; // Obtém o nome de usuário do token de autenticação

        const username = req.params.username
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
            msg: err.message || 'Some error occurred while retrieving the bookings.'
        });
    }
};
