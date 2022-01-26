const ERRORS = require("../error.js");
const _2FA = require("./2fa.models")

module.exports = async (phone_number, code, session_id) => {
    let _2fa = await _2FA.verify(phone_number, session_id, code);

    if (_2fa.verification_status == "approved") {
        return true;
    } else if (_2fa.verification_status == "pending") {
        throw new ERRORS.Forbidden();
    }
};