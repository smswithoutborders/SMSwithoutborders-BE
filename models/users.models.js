module.exports = (sequelize, Sequelize) => {
    let Users = sequelize.define("users", {
        id: {
            type: Sequelize.STRING(64),
            defaultValue: Sequelize.UUIDV1,
            primaryKey: true
        },
        password: Sequelize.STRING,
        auth_key: Sequelize.STRING,
        iv: Sequelize.STRING,
    });

    return Users;
}