const db = require("../models/index.js");
const Payment = db.payment;
const PaymentType = db.payment_type;
const PaymentStatus = db.payment_status;

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
      const payments = await Payment.findAll();
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
            //  mostra as caracteristicas daquele item mas que está em outras tabelas, através da relacao entre as tabelas
            // include: [
            //     {
            //         // eager loading
            //         model: PaymentType,
            //         attributes: ['ID', 'type'] 
            //     },
            //     {
            //         model: PaymentStatus,
            //         attributes: ['ID', 'status_name']                
            //     }
            // ]
        })

        if (payment === null) {
            return res.status(400).json({
                success: false,
                msg: `Cant find any paymeny with id ${req.params.ID}`
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