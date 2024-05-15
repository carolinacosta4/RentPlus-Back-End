module.exports = (sequelize, DataTypes, models) => {
  const reservation = sequelize.define(
    "reservation",
    {
      // ATRIBUTOS
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      property_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "property",
          key: "ID",
        },
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      status_reservation_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "status_reservation",
          key: "ID",
        },
      },
      dateIn: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dateOut: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      total_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      // DEFINIÇÕES
      freezeTableName: true,
      timestamps: false,
    }
  );

  // ASSOCIATE

  reservation.associate = (models) => {
    /* // USER
    reservation.belongsTo(models.user, {
      foreignKey: "username", // username is the FK in reservation
      targetKey: "username", // username is the PK in user
      as: "user",
    });

    // PAYMENT
    reservation.hasMany(models.payment, {
      foreignKey: "reservation_ID",
      as: "payments",
    });
*/

    // PROPERTY
    /* reservation.belongsTo(models.property, {
      foreignKey: "property_ID",
      as: "property",
    });  */
    // STATUS
    reservation.belongsTo(models.status_reservation, {
      foreignKey: "status_reservation_ID",
      as: "status",
    });

    // REVIEWS
    reservation.hasMany(models.review, {
      foreignKey: "reservation_ID",
      as: "reviews",
    });
  };

  return reservation;
};
