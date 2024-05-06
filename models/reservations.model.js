module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define(
    "Reservation",
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
          model: "Property",
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
          model: "ReservationStatus",
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
    }
  );

  console.log(Reservation === sequelize.models.Reservation);
};
