module.exports = (sequelize, Sequelize) => {
    let Platform = sequelize.define("platform", {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        description: Sequelize.STRING,
        description_en: Sequelize.TEXT,
        description_fr: Sequelize.TEXT,
        logo: Sequelize.TEXT,
        protocols: Sequelize.TEXT,
        type: Sequelize.STRING,
        letter: Sequelize.STRING
    });

    return Platform;
}