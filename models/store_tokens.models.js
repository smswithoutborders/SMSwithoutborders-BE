const ERRORS = require("../error.js");
const db = require("../schemas");
const Security = require("./security.models.js");

var Token = db.tokens;

module.exports = async (user, platform, result) => {
    var security = new Security(user.password);
    const platform_name = platform.name.toLowerCase()

    if (platform_name == "gmail") {
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
    };

    if (platform_name == "twitter") {
        await Token.create({
            userId: user.id,
            platformId: platform.id,
            username: security.encrypt(JSON.stringify(result.profile.name)).e_info,
            token: security.encrypt(JSON.stringify(result.token)).e_info,
            uniqueId: security.encrypt(JSON.stringify(result.profile.screen_name)).e_info,
            uniqueIdHash: security.hash(result.profile.screen_name),
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
    };

    if (platform_name == "telegram") {
        await Token.create({
            userId: user.id,
            platformId: platform.id,
            token: security.encrypt(JSON.stringify(result)).e_info,
            uniqueId: security.encrypt(JSON.stringify(result)).e_info,
            uniqueIdHash: security.hash(result),
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
    };

    throw new ERRORS.NotFound();
}