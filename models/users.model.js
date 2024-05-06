module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      username: {
        primaryKey: true,
        type: DataTypes.STRING,
        allowNull: false,
        // validate: { notNull: { msg: "Title can not be empty or null!" } }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.TEXT,
        allowNull: false,
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
  return user;
};
