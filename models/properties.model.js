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
        validate: { notNull: { msg: "Title is required!" } }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notNull: { msg: "Description is required!" } }
      },
      location: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: { notNull: { msg: "Location is required!" } }
      },
      map_url: {
        type: DataTypes.STRING,
        allowNull: false,
        isUrl: true,
        validate: { notNull: { msg: "Map URL is required!" }, isUrl: { msg: "URL format invalid." } }
      },
      daily_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { notNull: { msg: "Daily price is required!" } }
      },
      guest_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { notNull: { msg: "Number of guests is required!" } }
      },
      bathrooms: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        validate: { notNull: { msg: "Number of bathrooms is required!" } }
      },
      bedrooms: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        validate: { notNull: { msg: "Number of bedrooms is required!" } }
      },
      beds: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        validate: { notNull: { msg: "Number of beds is required!" } }
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
      as: "owner",
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
      foreignKey: "ID",
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
};
