const configs = require("../config.json");
const Sequelize = require("sequelize");

var sequelize = new Sequelize(configs.database.MYSQL_DATABASE, configs.database.MYSQL_USER, configs.database.MYSQL_PASSWORD, {
    host: configs.database.MYSQL_HOST,
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
db.usersInfo = require("./usersInfo.models.js")(sequelize, Sequelize);

db.users.hasMany(db.tokens, {
    foreignKey: "userId"
});
db.tokens.belongsTo(db.users);
db.users.hasMany(db.usersInfo, {
    foreignKey: "userId"
});
db.usersInfo.belongsTo(db.users);
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

module.exports = db;