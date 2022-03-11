"use strict";

const ERRORS = require("../error.js");
const db = require("../schemas");
let logger = require("../logger");

const Session = db.sessions;
const SmsVerification = db.smsVerification;

module.exports = async (sid, svid, user_agent, status, cookie, type) => {
    logger.debug(`Finding User's session ${sid} ...`);

    let session = await Session.findAll({
        where: {
            sid: sid,
            user_agent: user_agent,
            status: status,
            type: type,
            svid: svid
        }
    }).catch(error => {
        logger.error("ERROR FINDING SESSION");
        throw new ERRORS.InternalServerError(error);
    });

    if (session.length < 1) {
        logger.error("NO SESSION FOUND");
        throw new ERRORS.Unauthorized();
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

    logger.debug(`Finding SMS verification session id ...`);

    let SV = await SmsVerification.findAll({
        where: {
            svid: session[0].svid
        }
    }).catch(error => {
        logger.error("ERROR FINDING SV");
        throw new ERRORS.InternalServerError(error);
    });

    if (SV.length < 1) {
        logger.error("NO SV FOUND");
        throw new ERRORS.Forbidden();
    };

    // IF MORE THAN ONE SV EXIST IN DATABASE
    if (SV.length > 1) {
        logger.error("DUPLICATE SV FOUND");
        throw new ERRORS.Conflict();
    };

    logger.info("SESSION VERIFICATION SUCCESSFUL");
    return {
        unique_identifier: session[0].unique_identifier,
        session_id: SV[0].session_id
    };
}