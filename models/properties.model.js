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
        onDelete: "cascade",
      },
      property_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "property_type",
          key: "ID",
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
      onDelete: 'CASCADE',
    });

    // TYPE
    property.belongsTo(models.property_type, {
      foreignKey: "property_type",
      targetKey: "ID",
      as: "type_of_prop",
    });

    // RESERVATION
    property.hasMany(models.reservation, {
      foreignKey: "property_ID",
      as: "reservations",
      onDelete: 'CASCADE'
    });

    // FAVORITES
    property.hasMany(models.favorites, {
      foreignKey: "property_ID",
      as: "favorites",
      onDelete: 'CASCADE'
    });

    // PHOTOS
    property.hasMany(models.photos_property, {
      foreignKey: "property_ID",
      targetKey: "ID",
      as: "photos",
      onDelete: 'CASCADE'
    });

    // MESSAGES
    property.hasMany(models.message, {
      onDelete: "cascade",
      foreignKey: "property_ID", // username is FK in reservation
      sourceKey: "ID", // username is PK in user
      as: "messages",
    });

    // AMENITY - TABLE WITH IDs
    property.belongsToMany(models.amenity, {
      through: "amenity_property",
      foreignKey: "property_ID",
      otherKey: "amenity_ID",
      as: "amenities",
      timestamps: false
    });
  };

  return property;
};