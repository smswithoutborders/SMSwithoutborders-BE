module.exports = (sequelize, Sequelize) => {
    let SVRetries = sequelize.define("svretries", {
        userId: Sequelize.STRING,
        uniqueId: Sequelize.STRING,
        count: Sequelize.INTEGER,
        expires: Sequelize.DATE
    });

    return SVRetries;
}