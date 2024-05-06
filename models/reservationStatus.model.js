module.exports = (sequelize, DataTypes) => {
  const status_reservation = sequelize.define(
    "status_reservation",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      status_name: {
        type: DataTypes.ENUM("confirmed", "canceled", "pending"),
        defaultValue: "pending",
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  console.log(status_reservation === sequelize.models.status_reservation);
  return status_reservation
};
