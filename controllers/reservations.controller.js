const db = require("../models/index.js");
const Reservation = db.reservation;
const ReservationStatus = db.status_reservation;
const { ValidationError } = require('sequelize');

exports.findAll = async (req, res) => {
    try {
      const reservs = await Reservation.findAll();
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
            
        let reservation = await Reservation.findByPk(req.params.ID)

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

// CONTINUAR AQUI CRIANDO O BODY VALIDATOR PRA ADICIONAR UM NOVO BOOKING E DEPOIS CRIANDO O BOOKING
exports.bodyValidator = (req, res, next) => {
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