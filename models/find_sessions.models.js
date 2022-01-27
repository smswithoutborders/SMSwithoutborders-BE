const ERRORS = require("../error.js");
const db = require("../schemas");

var Session = db.sessions;

module.exports = async (sid, uid, user_agent, cookie) => {
    let session = await Session.findAll({
        where: {
            sid: sid,
            user_agent: user_agent,
            userId: uid
        }
    }).catch(error => {
        console.error("ERROR FINDING SESSION IN SESSIONS TABLE");
        throw new ERRORS.InternalServerError(error);
    });

    if (session.length < 1) {
        console.error("NO SESSION FOUND");
        throw new ERRORS.NotFound();
    };

    // IF MORE THAN ONE SESSION EXIST IN DATABASE
    if (session.length > 1) {
        console.error("DUPLICATE SESSION FOUND");
        throw new ERRORS.Conflict();
    };

    const expires = session[0].expires;

    let age = expires - Date.now();

    if (age <= 0) {
        console.error("EXPIRED SESSION");
        throw new ERRORS.Forbidden();
    }

    if (session[0].data !== JSON.stringify(cookie)) {
        console.error("INVALID COOKIE FROM BROWSER");
        throw new ERRORS.Forbidden();
    }

    console.log("SESSION VERIFICATION SUCCESSFUL RETURNING USERID");
    return session[0].userId;
}