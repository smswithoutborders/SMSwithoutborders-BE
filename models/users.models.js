module.exports = (sequelize, Sequelize) => {
    let Users = sequelize.define("users", {
        id: {
            type: Sequelize.STRING(64),
            defaultValue: Sequelize.UUIDV1,
            primaryKey: true
        },
        password: Sequelize.STRING,
        auth_key: Sequelize.STRING,
        status: {
            type: Sequelize.ENUM(['verified', 'unverified']),
            defaultValue: "unverified"
        }
    });

    return Users;
}