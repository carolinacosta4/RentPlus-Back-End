module.exports = (sequelize, DataTypes) => {
  const payment_type = sequelize.define(
    "payment_type",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("credit_card", "paypal", "bank_transfer"),
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  console.log(payment_type === sequelize.models.payment_type);
  return payment_type
};
