"use strict";

const ERRORS = require("../error.js");
const db = require("../schemas");
let logger = require("../logger");

const config = require('config');
const SERVER_CFG = config.get("SERVER");
let secure = "";
if (SERVER_CFG.api.secure_sessions == undefined) {
    secure = true;
} else {
    secure = SERVER_CFG.api.secure_sessions
}
const maxAge = SERVER_CFG.api.session_maxAge;

var Session = db.sessions;

module.exports = async (sid, uid) => {
    const hour = eval(maxAge) || 2 * 60 * 60 * 1000;
    const data = {
        maxAge: hour,
        secure: secure,
        httpOnly: true,
        sameSite: 'lax'
    };

    logger.debug(`Secure Session: ${secure}`);
    logger.debug(`Session maxAge: ${hour}`);
    logger.debug(`Finding session ${sid} ...`);

    let session = await Session.findAll({
        where: {
            sid: sid,
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

    if (session.length > 1) {
        logger.error("DUPLICATE SESSION FOUND");
        throw new ERRORS.Conflict();
    };

    logger.debug(`Updating session ${sid} ...`);

    await session[0].update({
        expires: new Date(Date.now() + hour),
        data: JSON.stringify(data)
    })

    logger.info("SUCCESSFULLY UPDATED SESSION");
    return {
        sid: session[0].sid,
        uid: session[0].userId,
        data: data
    };
}