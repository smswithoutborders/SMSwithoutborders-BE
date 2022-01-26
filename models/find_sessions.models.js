const ERRORS = require("../error.js");
const db = require("../schemas");

var Session = db.sessions;

module.exports = async (sid, user_agent, cookie) => {
    let session = await Session.findAll({
        where: {
            sid: sid,
            user_agent: user_agent,
        }
    }).catch(error => {
        throw new ERRORS.InternalServerError(error);
    });

    if (session.length < 1) {
        throw new ERRORS.Forbidden();
    };

    // IF MORE THAN ONE SESSION EXIST IN DATABASE
    if (session.length > 1) {
        throw new ERRORS.Conflict();
    };

    const expires = session[0].expires;

    let age = expires - Date.now();

    if (age <= 0) {
        console.log(age)
        throw new ERRORS.Forbidden();
    }

    if (session[0].data !== JSON.stringify(cookie)) {
        throw new ERRORS.Forbidden();
    }

    console.log(age)
    return session[0].userId;
}