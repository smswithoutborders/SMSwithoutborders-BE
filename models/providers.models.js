module.exports = (sequelize, Sequelize) => {
    let Provider = sequelize.define("provider", {
        name: Sequelize.STRING,
        description: Sequelize.STRING
    });

    return Provider;
}