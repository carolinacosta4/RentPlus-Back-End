module.exports = (sequelize, DataTypes) => {
  const PhotosProperty = sequelize.define(
    "PhotosProperty",
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
          model: "Property",
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

  console.log(PhotosProperty === sequelize.models.PhotosProperty);
};
