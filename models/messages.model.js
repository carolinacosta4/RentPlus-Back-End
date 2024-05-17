module.exports = (sequelize, DataTypes) => {
  const message = sequelize.define(
    "message",
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
          model: "user",
          key: "username",
        },
      },
      sender_username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
          model: "user",
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

    // PROPERTY
    message.belongsTo(models.property, {
      foreignKey: "property_ID",
      targetKey: "ID",
      as: "property",
    });
  };

  return message;
};
