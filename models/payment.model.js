module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      reservation_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Reservation",
          key: "ID",
        },
      },
      status_payment: {
        type: DataTypes.STRING(32),
        allowNull: false,
        references: {
          model: "StatusPayment",
          key: "status",
        },
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      payment_tpe: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "PaymentType",
          key: "ID",
        },
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  console.log(Payment === sequelize.models.Payment);
};
