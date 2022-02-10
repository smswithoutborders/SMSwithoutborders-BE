const config = require('config');
const SERVER_CFG = config.get("SERVER");

const Sequelize = require("sequelize");

module.exports = db = {};

initialize();

async function initialize() {
    // connect to db
    const sequelize = new Sequelize(SERVER_CFG.database.MYSQL_DATABASE, SERVER_CFG.database.MYSQL_USER, SERVER_CFG.database.MYSQL_PASSWORD, {
        host: SERVER_CFG.database.MYSQL_HOST,
        dialect: "mysql",
        logging: false,
        // define: {
        //     timestamps: false
        // }
    });

    // init models and add them to the exported db object
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    db.users = require("./users.schema.js")(sequelize, Sequelize);
    db.wallets = require("./wallets.schema.js")(sequelize, Sequelize);
    db.platforms = require("./platforms.schema.js")(sequelize, Sequelize);
    db.usersInfo = require("./usersInfo.schema.js")(sequelize, Sequelize);
    db.smsVerification = require("./smsVerification.schema.js")(sequelize, Sequelize);
    db.sessions = require("./sessions.schema.js")(sequelize, Sequelize);

    // https://sequelize.org/master/manual/assocs.html

    // relationship users table -> wallets table 
    db.users.hasMany(db.wallets, {
        foreignKey: "userId"
    });
    db.wallets.belongsTo(db.users);

    // relationship users table -> usersInfo table 
    db.users.hasOne(db.usersInfo, {
        foreignKey: "userId"
    });
    db.usersInfo.belongsTo(db.users);

    // relationship platforms table -> wallets table 
    db.platforms.hasMany(db.wallets, {
        foreignKey: "platformId"
    });
    db.wallets.belongsTo(db.platforms);

    // relationship smsVerification table -> users table 
    db.users.hasMany(db.smsVerification, {
        foreignKey: "userId"
    });
    db.smsVerification.belongsTo(db.users);

    // relationship users table -> sessions table 
    db.users.hasMany(db.sessions, {
        foreignKey: "unique_identifier"
    });
    db.sessions.belongsTo(db.users, {
        foreignKey: "unique_identifier"
    });

    // relationship smsVerification table -> sessions table 
    db.smsVerification.hasMany(db.sessions, {
        foreignKey: "svid"
    });
    db.sessions.belongsTo(db.smsVerification, {
        foreignKey: "svid"
    });

    //db options
    const options = {
        alter: true,
        alter: {
            drop: false
        }
    }

    // sync all models with database
    await sequelize.sync(options);
}