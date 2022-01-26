const ERRORS = require("../error.js");
const db = require("../schemas");

var Session = db.Session;

module.exports = async (userId, user_agent) => {
    const hour = 2 * 60 * 60 * 1000;
    const data = {
        maxAge: hour,
        secure: true,
        httpOnly: true,
        sameSite: 'lax'
    }
    let session = await Session.create({
        userId: userId,
        user_agent: user_agent,
        expires: new Date(Date.now() + hour),
        data: data
    }).catch(error => {
        throw new ERRORS.InternalServerError(error);
    });

    return {
        sid: session.sid,
        expires: session.expires,
        data: session.data
    };
}