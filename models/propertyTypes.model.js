module.exports = (sequelize, DataTypes) => {
  const PropertyType = sequelize.define(
    "PropertyType",
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

  console.log(PropertyType === sequelize.models.PropertyType);
};
