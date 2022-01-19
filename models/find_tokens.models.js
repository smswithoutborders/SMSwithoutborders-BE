const ERRORS = require("../error.js");
const db = require("../schemas");

var Token = db.tokens;

module.exports = async (user, platform) => {
    // SEARCH FOR TOKEN IN DB
    let token = await Token.findAll({
        where: {
            userId: user.id,
            platformId: platform.id
        }
    }).catch(error => {
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF TOKEN IS NOT FOUND
    if (token.length < 1) {
        throw new ERRORS.NotFound();
    }

    // IF MORE THAN ONE TOKEN EXIST IN DATABASE
    if (token.length > 1) {
        throw new ERRORS.Conflict();
    }

    return token[0];
}