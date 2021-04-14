module.exports = (sequelize, Sequelize) => {
    let Token = sequelize.define("token", {
        profile: Sequelize.TEXT,
        token: Sequelize.TEXT,
        iv: Sequelize.STRING
    });

    return Token;
}