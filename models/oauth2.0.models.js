const JsonField = require("sequelize-json");

module.exports = (sequelize, Sequelize) => {
    let OAuth2 = sequelize.define("oauth2", {
        profileId: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        profile: JsonField(sequelize, "oauth2", "profile"),
        accessToken: Sequelize.STRING,
        refreshToken: Sequelize.STRING
    });

    return OAuth2;
}