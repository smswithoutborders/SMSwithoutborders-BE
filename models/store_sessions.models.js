const ERRORS = require("../error.js");
const db = require("../schemas");

const config = require('config');
const SERVER_CFG = config.get("SERVER");
const secure = SERVER_CFG.api.secure_sessions;

var Session = db.sessions;

module.exports = async (userId, user_agent) => {
    const hour = 2 * 60 * 60 * 1000;
    const data = {
        maxAge: hour,
        secure: secure,
        httpOnly: true,
        sameSite: 'lax'
    }
    let session = await Session.create({
        userId: userId,
        user_agent: user_agent,
        expires: new Date(Date.now() + hour),
        data: JSON.stringify(data)
    }).catch(error => {
        console.error("ERROR CREATING SESSION IN SESSIONS TABLE")
        throw new ERRORS.InternalServerError(error);
    });

    return {
        sid: session.sid,
        uid: session.userId,
        data: data
    };
}