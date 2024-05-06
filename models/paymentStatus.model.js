module.exports = (sequelize, DataTypes) => {
  const status_payment = sequelize.define(
    "status_payment",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      status_name: {
        type: DataTypes.ENUM("confirmed", "pending"),
        defaultValue: "pending",
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  console.log(status_payment === sequelize.models.status_payment);
  return status_payment
};
