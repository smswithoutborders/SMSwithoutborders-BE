const configs = require("../config.json");
const Sequelize = require("sequelize");

var sequelize = new Sequelize(configs.database.MYSQL_DATABASE, configs.database.MYSQL_USER, configs.database.MYSQL_PASSWORD, {
    host: configs.database.MYSQL_HOST,
    dialect: "mysql",
    // logging: false,
    // define: {
    //     timestamps: false
    // }
});

var db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.users = require("./users.models.js")(sequelize, Sequelize);
db.tokens = require("./tokens.models.js")(sequelize, Sequelize);
db.providers = require("./providers.models.js")(sequelize, Sequelize);

db.users.hasMany(db.tokens, {
    foreignKey: "userId"
});
db.tokens.belongsTo(db.users);
db.providers.hasOne(db.tokens, {
    foreignKey: "providerId"
});
db.tokens.belongsTo(db.providers);

// // Create default providers
// db.providers.bulkCreate([{
//     name: "google",
//     platform: "gmail"
// }, {
//     name: "twitter",
//     platform: "twitter"
// }])

module.exports = db;