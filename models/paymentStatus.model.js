module.exports = (sequelize, DataTypes) => {
  const status_payment = sequelize.define(
    "status_payment",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        validate: { notNull: { msg: "ID is required!" } }
      },
      status_name: {
        type: DataTypes.ENUM("confirmed", "pending"),
        defaultValue: "pending",
        allowNull: false,
        validate: { notNull: { msg: "Status name is required!" } }
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  // ASSOCIATE
  status_payment.associate = (models) => {
    // PAYMENT
    status_payment.hasMany(models.payment, {
      foreignKey: "status_payment",
      as: "payments",
    });
  };

  return status_payment;
};
