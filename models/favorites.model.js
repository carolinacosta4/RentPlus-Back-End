module.exports = (sequelize, DataTypes) => {
  const favorites = sequelize.define(
    "favorites",
    {
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      property_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "property",
          key: "ID",
        },
        primaryKey: true,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  console.log(favorites === sequelize.models.favorites);
  return favorites
};
