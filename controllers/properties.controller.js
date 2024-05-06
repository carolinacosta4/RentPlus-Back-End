// propertyController.js
const db = require("../models/index.js");
const Property = db.property;

exports.findAll = async (req, res) => {
  try {
    const properties = await Property.findAll();
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.create = async (req, res) => {
  try {
    // Logic to create a property
    res
      .status(201)
      .json({ success: true, message: "Property created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.update = async (req, res) => {
  try {
    // Logic to update a property
    res
      .status(200)
      .json({ success: true, message: "Property updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.delete = async (req, res) => {
  try {
    // Logic to delete a property
    res
      .status(200)
      .json({ success: true, message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
