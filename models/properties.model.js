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

  console.log(property === sequelize.models.property);
  return property;
};

// OBS:
// Tudo que não tenha allowNull significa que pode ser null. É o default.
