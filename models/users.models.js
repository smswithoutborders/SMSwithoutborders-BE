module.exports = (sequelize, Sequelize) => {
    let Users = sequelize.define("users", {
        phone_number: Sequelize.STRING,
        password: Sequelize.STRING,
        auth_key: Sequelize.STRING,
        username: Sequelize.STRING,
        profileId: Sequelize.STRING,
        email: Sequelize.STRING
    });

    return Users;
}