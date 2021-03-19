module.exports = (sequelize, Sequelize) => {
    let Users = sequelize.define("users", {
        phone_number: Sequelize.STRING,
        password: Sequelize.STRING
    });

    return Users;
}