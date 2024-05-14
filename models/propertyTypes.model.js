module.exports = (sequelize, DataTypes) => {
  const property_type = sequelize.define(
    "property_type",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      type_name: {
        type: DataTypes.ENUM(
          "Igloo",
          "Beach",
          "Mansion",
          "Tiny home",
          "Apartment",
          "Country",
          "Wow",
          "Cave",
          "Tech",
          "Creative",
          "Tree house",
          "New",
          "Islands",
          "Floating",
          "Riad",
          "Farm"
        ),
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  property_type.associate = (models) => {
    // PHOTOS
    property_type.hasMany(models.property, {
      foreignKey: "ID",
      as: "properties",
    });
  };

  return property_type;
};
