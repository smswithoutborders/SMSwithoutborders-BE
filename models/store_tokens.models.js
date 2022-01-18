const ERRORS = require("../error.js");
const db = require(".");
const Security = require("./security.models.js");

var Token = db.tokens;

module.exports = async (user, platform, result) => {
    var security = new Security(user.password);

    await Token.create({
        userId: user.id,
        platformId: platform.id,
        username: security.encrypt(JSON.stringify(result.profile.data.name)).e_info,
        token: security.encrypt(JSON.stringify(result.token)).e_info,
        uniqueId: security.encrypt(JSON.stringify(result.profile.data.email)).e_info,
        uniqueIdHash: security.hash(result.profile.data.email),
        iv: security.iv
    }).catch(error => {
        if (error.name == "SequelizeUniqueConstraintError") {
            if (error.original.code == "ER_DUP_ENTRY") {
                throw new ERRORS.Conflict();
            };
        };

        throw new ERRORS.InternalServerError(error);
    });

    return user.auth_key;
}