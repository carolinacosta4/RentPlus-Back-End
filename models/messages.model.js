module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      receiver_username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
          model: "User",
          key: "username",
        },
      },
      sender_username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
          model: "User",
          key: "username",
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  console.log(Message === sequelize.models.Message);
};
