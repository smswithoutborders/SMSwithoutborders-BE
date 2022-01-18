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

db.users = require("./users.schema.js")(sequelize, Sequelize);
db.tokens = require("./tokens.schema.js")(sequelize, Sequelize);
db.providers = require("./providers.schema.js")(sequelize, Sequelize);
db.platforms = require("./platforms.schema.js")(sequelize, Sequelize);
db.usersInfo = require("./usersInfo.schema.js")(sequelize, Sequelize);
db.smsVerification = require("./smsVerification.schema.js")(sequelize, Sequelize);

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

// relationship platforms table -> tokens table 
db.platforms.hasMany(db.tokens, {
    foreignKey: "platformId"
});
db.tokens.belongsTo(db.platforms);

// relationship smsVerification table -> users table 
db.users.hasMany(db.smsVerification, {
    foreignKey: "userId"
});
db.smsVerification.belongsTo(db.users);

module.exports = db;