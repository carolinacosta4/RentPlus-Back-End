module.exports = (sequelize, DataTypes) => {
  const StatusPayment = sequelize.define(
    "StatusPayment",
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

  console.log(StatusPayment === sequelize.models.StatusPayment);
};
