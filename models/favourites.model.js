module.exports = (sequelize, DataTypes) => {
  const Favourite = sequelize.define(
    "Favourite",
    {
      username: {
        type: DataTypes.STRING(50),
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
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  console.log(Favourite === sequelize.models.Favourite);
};
