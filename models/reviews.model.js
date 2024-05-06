module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    "Review",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
          model: "User",
          key: "username",
        },
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reservationID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Reservation",
          key: "ID",
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  console.log(Review === sequelize.models.Review);
};
