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
      },
      property_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "PropertyType",
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

  console.log(property === sequelize.models.property);
  return property;
};

// OBS:
// Tudo que não tenha allowNull significa que pode ser null. É o default.
