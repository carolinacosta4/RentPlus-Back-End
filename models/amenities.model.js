module.exports = (sequelize, DataTypes) => {
  const amenity = sequelize.define(
    "amenity",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      amenity_name: {
        type: DataTypes.ENUM(
          "TV",
          "Wifi",
          "Air Conditioning",
          "Pets allowed",
          "Swimming Pool",
          "Jacuzzi",
          "Board Games",
          "Complete kitchen",
          "Beach utensils",
          "Laundry room",
          "Garage",
          "Smoke detector",
          "Hair dryer",
          "Fire extinguisher",
          "Yard",
          "Breakfast included",
          "Smoking allowed",
          "Central heating",
          "Washing machine"
        ),
        allowNull: false,
      },
      amenity_icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  // PROPERTY - TABLE WITH IDs

  amenity.associate = (models) => {
    amenity.belongsToMany(models.property, {
      through: "amenity_property",
      foreignKey: "amenity_ID",
      otherKey: "property_ID",
      as: "properties",
      timestamps: false
    });
  };

  return amenity;
};
