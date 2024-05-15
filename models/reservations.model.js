module.exports = (sequelize, DataTypes) => {
  const reservation = sequelize.define(
    "reservation",
    {
      // ATRIBUTOS
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        validate: { notNull: { msg: "ID is required!" } }
      },
      property_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "property",
          key: "ID",
        },
        validate: { notNull: { msg: "Propert ID is required!" } }
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: { notNull: { msg: "Username is required!" } }
      },
      status_reservation_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "status_reservation",
          key: "ID",
        },
        validate: { notNull: { msg: "Status Reservation ID is required!" } }
      },
      dateIn: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: { notNull: { msg: "Date in is required!" } }
      },
      dateOut: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: { notNull: { msg: "Date out is required!" } }
      },
      total_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { notNull: { msg: "Total price is required!" } }
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
    // USER
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

    // PROPERTY
    reservation.belongsTo(models.property, {
      foreignKey: "property_ID",
      as: "property",
    });

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
