module.exports = (sequelize, Sequelize) => {
    let Token = sequelize.define("token", {
        profileId: Sequelize.STRING,
        profile: Sequelize.TEXT,
        token: Sequelize.TEXT
    });

    return Token;
}