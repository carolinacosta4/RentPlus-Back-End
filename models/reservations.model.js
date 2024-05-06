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

  console.log(reservation === sequelize.models.reservation);
  return reservation
};
