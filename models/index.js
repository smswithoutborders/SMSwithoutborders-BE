const configs = require("../config.json");
const Sequelize = require("sequelize");

var sequelize = new Sequelize(configs.DATABASE, configs.OWNER, configs.PASSWORD, {
    host: configs.HOST,
    dialect: "mysql",
    define: {
        timestamps: false
    }
});

var db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.users = require("./users.models.js")(sequelize, Sequelize);
db.oauth2 = require("./oauth2.0.models.js")(sequelize, Sequelize);

db.users.belongsToMany(db.oauth2, {
    through: "user_oauth2",
    foreignKey: "userId"
});
db.oauth2.belongsToMany(db.users, {
    through: "user_oauth2",
    foreignKey: "profileId"
});

module.exports = db;