"use strict";

const ERRORS = require("../error.js");
const _2FA = require("./2fa.models");
let logger = require("../logger");

module.exports = async (phone_number, code, session_id) => {
    logger.debug(`initialising OTP code verification for ${phone_number} ...`);

    let _2fa = await _2FA.verify(phone_number, session_id, code);

    if (_2fa.verification_status == "approved") {
        logger.info("OTP CODE APPROVED");
        return true;
    } else if (_2fa.verification_status == "pending") {
        logger.error("OTP API RESPONDED WITH PENDING")
        throw new ERRORS.Forbidden();
    }
};