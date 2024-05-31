module.exports = (sequelize, DataTypes) => {
  const amenity_property = sequelize.define(
    "amenity_property",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      amenity_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "amenity",
          key: "ID",
        },
      },
      property_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "property",
          key: "ID",
        },
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  return amenity_property;
};
