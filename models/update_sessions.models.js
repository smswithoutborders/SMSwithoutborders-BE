const ERRORS = require("../error.js");
const db = require("../schemas");

const config = require('config');
const SERVER_CFG = config.get("SERVER");
const secure = SERVER_CFG.api.secure_sessions;

var Session = db.sessions;

module.exports = async (sid, uid) => {
    const hour = 2 * 60 * 60 * 1000;
    const data = {
        maxAge: hour,
        secure: secure,
        httpOnly: true,
        sameSite: 'lax'
    };

    let session = await Session.findAll({
        where: {
            sid: sid,
            userId: uid
        }
    }).catch(error => {
        console.error("ERROR FINDING SESSION IN SEESION TABLE");
        throw new ERRORS.InternalServerError(error);
    });

    if (session.length < 1) {
        console.error("NO SESSION FOUND");
        throw new ERRORS.Forbidden();
    };

    if (session.length > 1) {
        console.error("DUPLICATE SESSION FOUND");
        throw new ERRORS.Conflict();
    };


    await session[0].update({
        expires: new Date(Date.now() + hour),
        data: JSON.stringify(data)
    })

    console.log("SUCCESSFULLY UPDATED SESSION RETURNING DATA");
    return {
        sid: session[0].sid,
        uid: session[0].userId,
        data: data
    };
}