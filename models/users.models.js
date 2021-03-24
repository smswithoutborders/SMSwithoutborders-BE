module.exports = (sequelize, Sequelize) => {
    let Users = sequelize.define("users", {
        phone_number: Sequelize.STRING
    });

    return Users;
}