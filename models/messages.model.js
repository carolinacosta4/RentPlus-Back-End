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
      created_at: {
        type: DataTypes.DATE,
        get() {
          const rawValue = this.getDataValue('created_at');
          return rawValue ? rawValue.toISOString().slice(0, 19).replace('T', ' ') : null;
        },
        allowNull: false,
        validate: { notNull: { msg: "Date is required!" } },
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
      onDelete: 'CASCADE'
    });
    //
    message.belongsTo(models.user, {
      foreignKey: "receiver_username", // receiver_username is FK in message
      targetKey: "username", // username is PK in the user
      as: "receiver",
      onDelete: 'CASCADE'
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
