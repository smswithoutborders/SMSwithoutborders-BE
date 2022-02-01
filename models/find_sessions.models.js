const ERRORS = require("../error.js");
const db = require("../schemas");
let logger = require("../logger");

var Session = db.sessions;

module.exports = async (sid, uid, user_agent, cookie) => {
    logger.debug(`Finding User's session ${sid} ...`);

    let session = await Session.findAll({
        where: {
            sid: sid,
            user_agent: user_agent,
            userId: uid
        }
    }).catch(error => {
        logger.error("ERROR FINDING SESSION");
        throw new ERRORS.InternalServerError(error);
    });

    if (session.length < 1) {
        logger.error("NO SESSION FOUND");
        throw new ERRORS.Forbidden();
    };

    // IF MORE THAN ONE SESSION EXIST IN DATABASE
    if (session.length > 1) {
        logger.error("DUPLICATE SESSION FOUND");
        throw new ERRORS.Conflict();
    };

    logger.debug(`Authenticating session ...`);

    const expires = session[0].expires;

    let age = expires - Date.now();

    if (age <= 0) {
        logger.error("EXPIRED SESSION");
        throw new ERRORS.Forbidden();
    }

    if (session[0].data !== JSON.stringify(cookie)) {
        logger.error("INVALID COOKIE");
        throw new ERRORS.Forbidden();
    }

    logger.info("SESSION VERIFICATION SUCCESSFUL");
    return session[0].userId;
}