const ERRORS = require("../error.js");
const db = require("../schemas");
let logger = require("../logger");

const SmsVerification = db.smsVerification;

module.exports = async (session_id, svid) => {
    logger.debug(`Finding SMS verification record for ${session_id} ...`);

    let SV = await SmsVerification.findAll({
        where: {
            session_id: session_id,
            svid: svid
        }
    }).catch(error => {
        logger.error("ERROR FINDING SMS VERIFICATION RECORD");
        throw new ERRORS.InternalServerError(error);
    });

    if (SV.length < 1) {
        logger.error("NO SMS VERIFICATION RECORD FOUND");
        throw new ERRORS.Forbidden();
    };

    if (SV.length > 1) {
        logger.error("DUPLICATE SMS VERIFICATION RECORD FOUND");
        throw new ERRORS.Conflict();
    };

    logger.debug(`Fetching User with SMS verification ${session_id} ...`);

    let user = await SV[0].getUser();

    if (!user) {
        logger.error("NO USER FOUND");
        throw new ERRORS.Forbidden();
    }

    logger.debug(`Fetching Userinfo with Id ${user.id} ...`);

    let usersInfo = await user.getUsersInfo();

    if (!usersInfo) {
        logger.error("NO USERINFO FOUND");
        throw new ERRORS.Forbidden();
    }

    if (usersInfo.status == "verified") {
        logger.error("USER'S STATUS IS ALREADY VERIFIED");
        throw new ERRORS.Conflict();
    }

    logger.info("SMS VERIFICATION RECORD FOUND");
    return {
        usersInfo,
        user
    };
};