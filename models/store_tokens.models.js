const ERRORS = require("../error.js");
const db = require(".");
const Security = require("./security.models.js");

var Token = db.tokens;

module.exports = async (user, platform, result) => {
    var security = new Security(user.password);

    let new_token = await Token.create({
        profile: security.encrypt(JSON.stringify({
            data: {
                email: result.profile.data.email,
                name: result.profile.data.name
            }
        })).e_info,
        token: security.encrypt(JSON.stringify(result.token)).e_info,
        email: security.hash(result.profile.data.email),
        iv: security.iv
    }).catch(error => {
        throw new ERRORS.InternalServerError(error);
    });

    await new_token.update({
        userId: user.id,
        platformId: platform.id
    }).catch(error => {
        throw new ERRORS.InternalServerError(error);
    });

    return user.auth_key;
}