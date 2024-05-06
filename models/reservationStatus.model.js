module.exports = (sequelize, DataTypes) => {
  const ReservationStatus = sequelize.define(
    "ReservationStatus",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      status: {
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

  console.log(ReservationStatus === sequelize.models.ReservationStatus);
};
