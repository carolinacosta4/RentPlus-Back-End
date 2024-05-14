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

  // ASSOCIATE
  
  payment_type.associate = (models) => {
    // PAYMENT
    payment_type.hasMany(models.payment, {
      foreignKey: "payment_type",
      as: "payments",
    });
  };

  return payment_type;
};
