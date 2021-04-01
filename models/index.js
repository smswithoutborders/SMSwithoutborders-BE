const configs = require("../config.json");
const Sequelize = require("sequelize");

var sequelize = new Sequelize(configs.database.MYSQL_DATABASE, configs.database.MYSQL_USER, configs.database.MYSQL_PASSWORD, {
    host: configs.database.MYSQL_HOST,
    dialect: "mysql",
    // logging: false,
    define: {
        timestamps: false
    }
});

var db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.users = require("./users.models.js")(sequelize, Sequelize);
db.oauth2 = require("./oauth2.0.models.js")(sequelize, Sequelize);
db.providers = require("./providers.models.js")(sequelize, Sequelize);

db.users.hasMany(db.oauth2, {
    foreignKey: "userId"
});
db.oauth2.belongsTo(db.users);
db.providers.hasOne(db.oauth2, {
    foreignKey: "providerId"
});
db.oauth2.belongsTo(db.providers);

// // Create default providers
// db.providers.bulkCreate([{
//     name: "google"
// }, {
//     name: "twitter"
// }])

module.exports = db;