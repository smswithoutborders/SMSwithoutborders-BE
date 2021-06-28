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
db.smsVerification = require("./smsVerification.models.js")(sequelize, Sequelize);

// relationship users table -> tokens table 
db.users.hasMany(db.tokens, {
    foreignKey: "userId"
});
db.tokens.belongsTo(db.users);

// relationship users table -> usersInfo table 
db.users.hasMany(db.usersInfo, {
    foreignKey: "userId"
});
db.usersInfo.belongsTo(db.users);

// relationship providers table -> tokens table 
db.providers.hasOne(db.tokens, {
    foreignKey: "providerId"
});
db.tokens.belongsTo(db.providers);

// relationship providers table -> platforms table 
db.providers.hasMany(db.platforms, {
    foreignKey: "providerId"
});
db.platforms.belongsTo(db.providers);

// relationship platforms table -> tokens table 
db.platforms.hasOne(db.tokens, {
    foreignKey: "platformId"
});
db.tokens.belongsTo(db.platforms);

// relationship smsVerification table -> users table 
db.users.hasMany(db.smsVerification, {
    foreignKey: "userId"
});
db.smsVerification.belongsTo(db.users);

module.exports = db;