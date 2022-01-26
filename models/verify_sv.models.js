const ERRORS = require("../error.js");
const db = require("../schemas");

const SmsVerification = db.smsVerification;

module.exports = async (session_id, svid) => {
    let SV = await SmsVerification.findAll({
        where: {
            session_id: session_id,
            svid: svid
        }
    }).catch(error => {
        throw new ERRORS.InternalServerError(error);
    });

    if (SV.length < 1) {
        throw new ERRORS.NotFound();
    };

    if (SV.length > 1) {
        throw new ERRORS.Conflict();
    };

    let user = await SV[0].getUser();

    if (!user) {
        throw new ERRORS.NotFound();
    }

    let usersInfo = await user.getUsersInfo();

    if (!usersInfo) {
        throw new ERRORS.NotFound();
    }

    if (usersInfo.status == "verified") {
        throw new ERRORS.Conflict();
    }

    return {
        usersInfo,
        user
    };
};