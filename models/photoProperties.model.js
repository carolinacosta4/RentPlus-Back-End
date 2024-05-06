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
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  console.log(photos_property === sequelize.models.photos_property);
  return photos_property
};
