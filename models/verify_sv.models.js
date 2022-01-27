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
        console.error("ERROR FINDING SMS VERIFICATION RECORD IN SMS VERIFICATION TABLE");
        throw new ERRORS.InternalServerError(error);
    });

    if (SV.length < 1) {
        console.error("NO SMS VERIFICATION RECORD FOUND");
        throw new ERRORS.NotFound();
    };

    if (SV.length > 1) {
        console.error("DUPLICATE SMS VERIFICATION RECORD FOUND");
        throw new ERRORS.Conflict();
    };

    let user = await SV[0].getUser();

    if (!user) {
        console.error("NO USER FOUND FROM SMS VERIFICATION RECORD");
        throw new ERRORS.NotFound();
    }

    let usersInfo = await user.getUsersInfo();

    if (!usersInfo) {
        console.error("NO USERINFO FOUND FROM SMS USER RECORD");
        throw new ERRORS.NotFound();
    }

    if (usersInfo.status == "verified") {
        console.error("USER'S STATUS IS ALREADY VERIFIED");
        throw new ERRORS.Conflict();
    }

    console.log("SMS VERIFICATION FOUND RETURNING DATA");
    return {
        usersInfo,
        user
    };
};