const db = require("../models/index.js");
const Amenity = db.amenity;

exports.findAll = async (req, res) => {

    try {
        const amenities = await Amenity.findAndCountAll({
            order: [['amenity_name', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            data: amenities.rows,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message || 'Some error occurred while retrieving the amenities.'
        });
    }
};