module.exports = (sequelize, Sequelize) => {
    let Token = sequelize.define("token", {
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

    return Token;
}