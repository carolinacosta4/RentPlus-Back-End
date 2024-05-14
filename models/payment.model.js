module.exports = (sequelize, DataTypes) => {
  const payment = sequelize.define(
    "payment",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        validate: { notNull: { msg: "ID is required!" } } // AQUI
      },
      reservation_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "reservation",
          key: "ID",
        },
        validate: { notNull: { msg: "Reservation ID is required!" } }
      },
      status_payment: {
        type: DataTypes.STRING(32),
        allowNull: false,
        references: {
          model: "status_payment",
          key: "status",
        },
        validate: { notNull: { msg: "Status payment is required!" } }
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { notNull: { msg: "Amount is required!" } }
      },
      payment_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { notNull: { msg: "Payment type is required!" } },
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
