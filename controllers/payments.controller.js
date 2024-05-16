const db = require("../models/index.js");
const Payment = db.payment;
const { ValidationError } = require('sequelize');

// exports.bodyValidator = (req, res, next) => {
//     if (!req.body.ID || !req.body.reservation_ID || !req.body.status_payment  || !req.body.amount  || !req.body.payment_type) {
//         return res.status(400).json({
//             error: "Some information are missing"
//         })
//     }
//     next()
// };

exports.findAll = async (req, res) => {
    try {
      const payments = await Payment.findAll({include: [
        {
          model: db.status_payment,
          as: 'status',
          attributes: ['status_name']
        },
        {
          model: db.payment_type,
          as: 'type',
          attributes: ['type']
        }], order: [["ID", 'DESC']]});
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
};

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

exports.findOne = async (req, res) => {
    try {
        if (!parseInt(req.params.ID)) {
                return res.status(400).json({
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
            ]})

        if (payment === null) {
            return res.status(404).json({
                success: false,
                msg: `Can't find any payment with id ${req.params.ID}`
            })
        }
        else {
            return res.json({
                success: true,
                data: payment,
                links: [
                    { "rel": "modify", "href": `/payments/${payment.ID}`, "method": "POST" }
                ]
            })
        }
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Some error occurred while finding the payment."})
    };
};

exports.changeStatus = async (req, res) => {
  try {
      const reservationId = req.params.ID;
      const newStatusName = req.body.status_name;

      // Verifica se a reserva existe
      const payment = await Payment.findByPk(reservationId);
      if (!payment) {
          return res.status(404).json({
              success: false,
              msg: `There is no reservation with the ID ${reservationId}`
          });
      }

      // Verifica se o novo status existe pelo nome
      const status = await db.status_payment.findOne({ where: { status_name: newStatusName } });
      if (!status) {
          return res.status(400).json({
              success: false,
              msg: `There is no status with the name ${newStatusName}`
          });
      }

      // Atualiza o status da reserva
      payment.status_payment = status.ID;
      await payment.save();

      const updatedPayment = await Payment.findByPk(reservationId, {
          include: [
              {
                  model: db.status_payment,
                  as: 'status',
                  attributes: ['status_name']
              }
          ]
      });

      res.status(200).json({
          success: true,
          msg: 'Reservation status successfully updated.',
          data: updatedPayment
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