const axios = require("axios");
const config = require('config');
const RECAPTCHA = config.get("RECAPTCHA");
const SECRET_KEY = RECAPTCHA.SECRET_KEY;

module.exports = async (captchaToken, remoteIp) => {
    // Call Google's API to get score
    const res = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${captchaToken}&remoteip=${remoteIp}`
    );

    // Extract result from the API response
    if (res.data.success) {
        return true;
    } else {
        return false
    };
}