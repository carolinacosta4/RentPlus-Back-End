module.exports = (sequelize, DataTypes) => {
  const payment_type = sequelize.define(
    "payment_type",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        validate: { notNull: { msg: "ID is required!" } }
      },
      type: {
        type: DataTypes.ENUM("credit_card", "paypal", "bank_transfer"),
        allowNull: false,
        validate: { notNull: { msg: "Type is required!" } }
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
      onDelete: 'CASCADE'
    });
  };

  return payment_type;
};
