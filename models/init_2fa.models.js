const ERRORS = require("../error.js");
const db = require("../schemas");
const _2FA = require("./2fa.models")

const SmsVerification = db.smsVerification;

module.exports = async (userId, phone_number) => {
    let _2fa = await _2FA.send(phone_number);

    if (_2fa) {
        let SV = await SmsVerification.create({
            userId: userId,
            session_id: _2fa.service_sid,
        }).catch(error => {
            console.error("ERROR CREATING 2FA SESSION IN SMS VERIFICATION TABLE");
            throw new ERRORS.InternalServerError(error);
        });

        console.log("SUCCESSFULLY REQUESTED TWILIO CODE RETURNING DATA");
        return {
            session_id: SV.session_id,
            svid: SV.svid
        };
    };
};