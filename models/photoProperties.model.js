module.exports = (sequelize, DataTypes) => {
  const photos_property = sequelize.define(
    "photos_property",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      property_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "property",
          key: "ID",
        },
      },
      photo: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      cloudinary_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  // ASSOCIATE

  photos_property.associate = (models) => {
    // PROPERTY
    photos_property.belongsTo(models.property, {
      foreignKey: "property_ID", // property_ID is the FK in property
      as: "property",
    });
  };
  return photos_property;
};
