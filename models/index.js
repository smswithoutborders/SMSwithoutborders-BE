const configs = require("../config.json");
const Sequelize = require("sequelize");

// ==================== PRODUCTION ====================
var sequelize = new Sequelize(configs.production.database.MYSQL_DATABASE, configs.production.database.MYSQL_USER, configs.production.database.MYSQL_PASSWORD, {
    host: configs.production.database.MYSQL_HOST,
    dialect: "mysql",
    logging: false,
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
db.platforms = require("./platforms.models.js")(sequelize, Sequelize);

db.users.hasMany(db.tokens, {
    foreignKey: "userId"
});
db.tokens.belongsTo(db.users);
db.providers.hasOne(db.tokens, {
    foreignKey: "providerId"
});
db.tokens.belongsTo(db.providers);
db.providers.hasMany(db.platforms, {
    foreignKey: "providerId"
});
db.platforms.belongsTo(db.providers);
db.platforms.hasOne(db.tokens, {
    foreignKey: "platformId"
});
db.tokens.belongsTo(db.platforms);
// ====================================================

// ==================== DEVELOPMENT ====================
var sequelizeDev = new Sequelize(configs.development.database.MYSQL_DATABASE, configs.development.database.MYSQL_USER, configs.development.database.MYSQL_PASSWORD, {
    host: configs.development.database.MYSQL_HOST,
    dialect: "mysql",
    logging: false,
    // define: {
    //     timestamps: false
    // }
});

var dbDev = {};

dbDev.sequelize = sequelizeDev;
dbDev.Sequelize = Sequelize;

dbDev.users = require("./users.models.js")(sequelizeDev, Sequelize);
dbDev.tokens = require("./tokens.models.js")(sequelizeDev, Sequelize);
dbDev.providers = require("./providers.models.js")(sequelizeDev, Sequelize);
dbDev.platforms = require("./platforms.models.js")(sequelizeDev, Sequelize);

dbDev.users.hasMany(dbDev.tokens, {
    foreignKey: "userId"
});
dbDev.tokens.belongsTo(dbDev.users);
dbDev.providers.hasOne(dbDev.tokens, {
    foreignKey: "providerId"
});
dbDev.tokens.belongsTo(dbDev.providers);
dbDev.providers.hasMany(dbDev.platforms, {
    foreignKey: "providerId"
});
dbDev.platforms.belongsTo(dbDev.providers);
dbDev.platforms.hasOne(dbDev.tokens, {
    foreignKey: "platformId"
});
dbDev.tokens.belongsTo(dbDev.platforms);
// =====================================================

module.exports = {
    db,
    dbDev
};