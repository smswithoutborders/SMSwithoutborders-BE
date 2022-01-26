module.exports = (sequelize, Sequelize) => {
    let Sessions = sequelize.define("sessions", {
        sid: {
            type: Sequelize.STRING(64),
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        user_agent: Sequelize.STRING,
        expires: Sequelize.DATE,
        data: Sequelize.TEXT,
    });

    return Sessions;
}