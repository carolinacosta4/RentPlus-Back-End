const dbConfig = require('../config/db.config.js');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect
    ,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection do DB has been established successfully.');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
    }
})();

const db = {};
//export the sequelize object (DB connection)
db.sequelize = sequelize;
//export USER model
db.user = require("./users.model.js")(sequelize, DataTypes);

// // optionally: SYNC
// (async () => {
//     try {
//         // await sequelize.sync({ force: true }); // creates tables, dropping them first if they already existed
//         // await sequelize.sync({ alter: true }); // checks the tables in the database (which columns they have, what are their data types, etc.), and then performs the necessary changes to make then match the models
//         // await sequelize.sync(); // creates tables if they don't exist (and does nothing if they already exist)
//         console.log('DB is successfully synchronized')
//     } catch (error) {
//         console.log(error)
//     }
// })();

module.exports = db;
