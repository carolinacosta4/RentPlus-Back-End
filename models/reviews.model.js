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

  // ASSOCIATE

  review.associate = (models) => {
    review.belongsTo(models.reservation, {
      foreignKey: "reservation_ID",
      as: "reservation",
    });

    // USER
    review.belongsTo(models.user, {
      foreignKey: "username", // username is the FK in reservation
      targetKey: "username", // username is the PK in user
      as: "userReview",
    });
  };

  return review;
};
