module.exports = (sequelize, Sequelize) => {
    let UsersInfo = sequelize.define("usersInfo", {
        phone_number: Sequelize.STRING,
        name: Sequelize.STRING,
        country_code: Sequelize.STRING
    });

    return UsersInfo;
}