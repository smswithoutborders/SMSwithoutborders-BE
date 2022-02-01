const ERRORS = require("../error.js");
const db = require("../schemas");
const _2FA = require("./2fa.models");
let logger = require("../logger");

const SmsVerification = db.smsVerification;

module.exports = async (userId, phone_number) => {
    logger.debug(`Triggering SMS verification for ${phone_number} ...`);

    let _2fa = await _2FA.send(phone_number);

    if (_2fa) {
        logger.debug(`Creating an SMS verification record for ${phone_number} ...`);

        let SV = await SmsVerification.create({
            userId: userId,
            session_id: _2fa.service_sid,
        }).catch(error => {
            logger.error("ERROR CREATING 2FA SESSION");
            throw new ERRORS.InternalServerError(error);
        });

        logger.info("SUCCESSFULLY REQUESTED TWILIO CODE");
        return {
            session_id: SV.session_id,
            svid: SV.svid
        };
    };
};