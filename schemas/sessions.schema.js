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
        status: {
            type: Sequelize.ENUM(['success', 'updated']),
            allowNull: true
        },
        type: {
            type: Sequelize.ENUM(['recovery']),
            allowNull: true
        }
    });

    return Sessions;
}