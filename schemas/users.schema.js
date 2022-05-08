module.exports = (sequelize, Sequelize) => {
    let Users = sequelize.define("users", {
        id: {
            type: Sequelize.STRING(64),
            defaultValue: Sequelize.UUIDV1,
            primaryKey: true
        },
        password: Sequelize.STRING,
        current_login: Sequelize.DATE,
        last_login: Sequelize.DATE
    });

    return Users;
}