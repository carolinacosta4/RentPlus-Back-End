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
    }
  );

  // ASSOCIATE

  // property.associate = (models) => {
  //   // USER
  //   property.belongsTo(models.user, {
  //     foreignKey: "username", // username is the FK in the favorites
  //     targetKey: "username", // username is the PK in the user
  //     as: "user",
  //   });
  // };

  return favorites;
};
