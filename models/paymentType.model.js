module.exports = (sequelize, DataTypes) => {
  const PaymentType = sequelize.define(
    "PaymentType",
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

  console.log(PaymentType === sequelize.models.PaymentType);
};
