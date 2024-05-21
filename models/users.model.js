module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      username: {
        primaryKey: true,
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { notNull: { msg: "Username is required!" }, is: { args: /^[a-zA-Z0-9_]+$/, msg: "The username contains invalid characters. Only alphanumeric characters and underscores are allowed." } }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        isEmail: true,
        unique: true,
        validate: { notNull: { msg: "Email is required!" }, isEmail: { msg: "Email invalid!" } }
      },
      phone_number: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { is: { args: /^[0-9-()+]+$/, msg: "The phone number provided is not in a valid format." } }
      },
      user_role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user", //
      },
      profile_image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
        validate: { notNull: { msg: "Password is required!" } }
      },
      is_confirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false, //
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      owner_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      otp: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      // DEFINIÇÕES
      freezeTableName: true, // Nome de tabela = Nome do Modelo
      timestamps: false, // Não preciso de saber quando uma propriedade foi criada nem levou update
    }
  );

  // ASSOCIATE

  user.associate = (models) => {
    // PROPERTIES
    user.hasMany(models.property, {
      onDelete: "cascade",
      foreignKey: "owner_username", // owner_username is FK in property
      sourceKey: "username", // username is PK in user
      as: "properties",
    });

    // RESERVATIONS
    user.hasMany(models.reservation, {
      onDelete: "cascade",
      foreignKey: "username", // username is FK in reservation
      sourceKey: "username", // username is PK in user
      as: "reservations",
    });

    // FAVORITES
    user.hasMany(models.favorites, {
      onDelete: "cascade",
      foreignKey: "username", // username is FK in favorites
      sourceKey: "username", // username is PK in user
      as: "favorites",
    });

    // REVIEWS
    user.hasMany(models.review, {
      onDelete: "cascade",
      foreignKey: "username", // username is FK in reservation
      sourceKey: "username", // username is PK in user
      as: "reviews",
    });

    // MESSAGES
    user.hasMany(models.message, {
      onDelete: "cascade",
      foreignKey: "sender_username", // sender_username is FK in message
      sourceKey: "username", // username is PK in user
      as: "messages_sent",
    });
    //
    user.hasMany(models.message, {
      onDelete: "cascade",
      foreignKey: "receiver_username", // receiver_username is FK in message
      sourceKey: "username", // username is PK in user
      as: "messages_received",
    });
  };

  return user;
};
