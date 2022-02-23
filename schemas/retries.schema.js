module.exports = (sequelize, Sequelize) => {
    let Retry = sequelize.define("retries", {
        uniqueId: Sequelize.STRING,
        count: Sequelize.INTEGER,
        block: Sequelize.INTEGER
    });

    return Retry;
}