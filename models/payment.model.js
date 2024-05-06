module.exports = (sequelize, DataTypes) => {
  const payment = sequelize.define(
    "payment",
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
          model: "reservation",
          key: "ID",
        },
      },
      status_payment: {
        type: DataTypes.STRING(32),
        allowNull: false,
        references: {
          model: "status_payment",
          key: "status",
        },
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      payment_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "payment_type",
          key: "ID",
        },
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  console.log(payment === sequelize.models.payment);
  return payment
};
