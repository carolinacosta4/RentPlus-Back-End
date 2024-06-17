module.exports = (sequelize, DataTypes) => {
  const favorites = sequelize.define(
    "favorites",
    {
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
          model: "user",
          key: "username",
        },
        primaryKey: true,
      },
      property_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "property",
          key: "ID",
        },
        primaryKey: true,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
      autoIncrement: false,
    }
  );

  // ASSOCIATE

  favorites.associate = (models) => {
    // USER
    favorites.belongsTo(models.user, {
      foreignKey: "username", // username is the FK in the favorites
      targetKey: "username", // username is the PK in the user
      as: "user",
      onDelete: 'CASCADE',
    });

    favorites.belongsTo(models.property, {
      foreignKey: "property_ID", // username is the FK in the favorites
      targetKey: "ID", // username is the PK in the user
      as: "properties",
      onDelete: 'CASCADE',
    });
  };

  return favorites;
};
