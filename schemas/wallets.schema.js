module.exports = (sequelize, Sequelize) => {
    let Wallet = sequelize.define("wallet", {
        username: Sequelize.STRING,
        token: Sequelize.TEXT,
        uniqueId: Sequelize.STRING,
        uniqueIdHash: {
            type: Sequelize.STRING,
            unique: true
        },
        iv: Sequelize.STRING
    }, {
        indexes: [{
            unique: true,
            fields: ['userId', 'platformId']
        }]
    });

    return Wallet;
}