module.exports = (sequelize, Sequelize) => {
    let Token = sequelize.define("token", {
        profile: Sequelize.TEXT,
        token: Sequelize.TEXT,
        email: Sequelize.STRING,
        iv: Sequelize.STRING
    });

    return Token;
}