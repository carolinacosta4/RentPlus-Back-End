const db = require("../models/index.js");
const PropertyTypes = db.property_type;

exports.findAll = async (req, res) => {

    try {
        const types = await PropertyTypes.findAndCountAll({
            order: [['type_name', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            data: types.rows,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message || 'Some error occurred while retrieving the proprty types.'
        });
    }
};