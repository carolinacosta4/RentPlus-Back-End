module.exports = (sequelize, DataTypes) => {
  const property = sequelize.define(
    "property",
    {
      // ATRIBUTOS
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      owner_username: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "user",
          key: "username",
        },
      },
      property_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "property_type",
          key: "type",
        },
      },
      title: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      map_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      daily_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      guest_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bathrooms: {
        type: DataTypes.SMALLINT,
        allowNull: false,
      },
      bedrooms: {
        type: DataTypes.SMALLINT,
        allowNull: false,
      },
      beds: {
        type: DataTypes.SMALLINT,
        allowNull: false,
      },
      is_blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      // DEFINIÇÕES
      freezeTableName: true, // Nome de tabela = Nome do Modelo
      timestamps: false, // Não preciso de saber quando uma propriedade foi criada nem levou update
    }
  );

  // ASSOCIATE

  property.associate = (models) => {
    // USER
    property.belongsTo(models.user, {
      foreignKey: "owner_username",
      targetKey: "username",
      as: "owner",
    });

    // TYPE
    property.belongsTo(models.property_type, {
      foreignKey: "property_type",
      targetKey: "ID",
      as: "type_of_prop",
    });

    // RESERVATION
    property.hasMany(models.reservation, {
      foreignKey: "ID",
      as: "reservations",
    });

    // FAVORITES
    property.hasMany(models.favorites, {
      foreignKey: "username",
      as: "favorites",
    });

    // PHOTOS
    property.hasMany(models.photos_property, {
      foreignKey: "property_ID",
      as: "photos",
    });

    // AMENITY - TABLE WITH IDs
    property.associate = (models) => {
      property.belongsToMany(models.amenity, {
        through: "amenity_property",
        foreignKey: "property_ID",
        otherKey: "amenity_ID",
        as: "amenities",
      });
    };
  };

  return property;
};
