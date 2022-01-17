module.exports = (sequelize, Sequelize) => {
    let Token = sequelize.define("token", {
        username: Sequelize.STRING,
        token: Sequelize.TEXT,
        uniqueId: Sequelize.STRING,
        iv: Sequelize.STRING
    });

    return Token;
}