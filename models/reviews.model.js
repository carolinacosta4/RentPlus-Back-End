module.exports = (sequelize, DataTypes) => {
  const review = sequelize.define(
    "review",
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
          model: "user",
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
      reservation_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "reservation",
          key: "ID",
        },
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  console.log(review === sequelize.models.review);
  return review
};
