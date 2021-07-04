module.exports = (sequelize, Sequelize) => {
    let Token = sequelize.define("token", {
        profile: Sequelize.TEXT,
        token: Sequelize.TEXT,
        email: {
            type: Sequelize.STRING,
            unique: true
        },
        iv: Sequelize.STRING
    });

    return Token;
}