module.exports = (sequelize, DataTypes) => {
  const status_reservation = sequelize.define(
    "status_reservation",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      status_name: {
        type: DataTypes.ENUM("confirmed", "canceled", "pending"),
        defaultValue: "pending",
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  // ASSOCIATE
  
  status_reservation.associate = (models) => {
    // RESERVATION
    status_reservation.hasMany(models.reservation, {
      foreignKey: "status_reservation_ID", // FK in reservations
      as: "reservations",
      onDelete: 'CASCADE'
    });
  };

  return status_reservation;
};
