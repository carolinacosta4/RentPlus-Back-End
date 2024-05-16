const db = require("../models/index.js");
const Payment = db.payment;

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
        }]});
      res.status(200).json(payments);
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