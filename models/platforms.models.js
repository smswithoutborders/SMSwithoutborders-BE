module.exports = (sequelize, Sequelize) => {
    let Platform = sequelize.define("platform", {
        name: Sequelize.STRING,
        description: Sequelize.STRING,
        logo: Sequelize.TEXT,
        type: Sequelize.STRING,
        letter: Sequelize.STRING
    });

    return Platform;
}