const dbConfig = require("../config/db.config.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection do DB has been established successfully.");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
})();

const db = {};
//export the sequelize object (DB connection)
db.sequelize = sequelize;
//export models
db.user = require("./users.model.js")(sequelize, DataTypes);

db.amenities = require("./amenities.model.js")(sequelize, DataTypes);
db.favorites = require("./favorites.model.js")(sequelize, DataTypes);
db.message = require("./messages.model.js")(sequelize, DataTypes);
db.payment = require("./payment.model.js")(sequelize, DataTypes);
db.status_payment = require("./paymentStatus.model.js")(sequelize, DataTypes);
db.payment_type = require("./paymentType.model.js")(sequelize, DataTypes);
db.photos_property = require("./photoProperties.model.js")(
  sequelize,
  DataTypes
);
db.property_type = require("./propertyTypes.model.js")(sequelize, DataTypes);
db.property = require("./properties.model.js")(sequelize, DataTypes);
db.reservation = require("./reservations.model.js")(sequelize, DataTypes);
db.status_reservation = require("./reservationStatus.model.js")(
  sequelize,
  DataTypes,
  db
);
db.review = require("./reviews.model.js")(sequelize, DataTypes);

// Define associations
Object.values(db).forEach((model) => {
  console.log(db);
  if (model.associate) {
    model.associate(db);
  }
});

// // optionally: SYNC
/* (async () => {
    try {
        // await sequelize.sync({ force: true }); // creates tables, dropping them first if they already existed
        // await sequelize.sync({ alter: true }); // checks the tables in the database (which columns they have, what are their data types, etc.), and then performs the necessary changes to make then match the models
       // await sequelize.sync(); // creates tables if they don't exist (and does nothing if they already exist)
        console.log('DB is successfully synchronized')
    } catch (error) {
       console.log(error)
    }
})(); */

module.exports = db;
