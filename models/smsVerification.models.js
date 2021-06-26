module.exports = (sequelize, Sequelize) => {
    let SmsVerification = sequelize.define("smsVerification", {
        svid: {
            type: Sequelize.STRING(64),
            defaultValue: Sequelize.UUIDV1,
            primaryKey: true
        },
        code: Sequelize.STRING,
        session_id: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
    });

    return SmsVerification;
}