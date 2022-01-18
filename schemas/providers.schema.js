module.exports = (sequelize, Sequelize) => {
    let Provider = sequelize.define("provider", {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        description: Sequelize.STRING,
        letter: Sequelize.STRING
    });

    return Provider;
}