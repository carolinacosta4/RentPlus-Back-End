module.exports = (sequelize, DataTypes) => {
  const message = sequelize.define(
    "message",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        validate: { notNull: { msg: "ID is required!" } }
      },
      receiver_username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
          model: "user",
          key: "username",
        },
        validate: { notNull: { msg: "Receiver username is required!" } }
      },
      sender_username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
          model: "user",
          key: "username",
        },
        validate: { notNull: { msg: "Sender username is required!" } }
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notNull: { msg: "Content is required!" } }
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  // ASSOCIATE

  message.associate = (models) => {
    // USER
    message.belongsTo(models.user, {
      foreignKey: "sender_username", // receiver_username is FK in message
      targetKey: "username", // username is PK in the user
      as: "sender",
    });
    //
    message.belongsTo(models.user, {
      foreignKey: "receiver_username", // receiver_username is FK in message
      targetKey: "username", // username is PK in the user
      as: "receiver",
    });
  };

  return message;
};
