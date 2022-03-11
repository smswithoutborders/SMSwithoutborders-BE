"use strict";

const ERRORS = require("../error.js");
const axios = require("axios");
const config = require('config');
const RECAPTCHA = config.get("RECAPTCHA");
const SECRET_KEY = RECAPTCHA.SECRET_KEY;
const ENABLE_RECAPTCHA = RECAPTCHA.ENABLE_RECAPTCHA;

let logger = require("../logger");

module.exports = async (captchaToken, remoteIp) => {
    if (ENABLE_RECAPTCHA) {
        // Call Google's API to get score
        logger.debug("Calling Google API to validate reCaptcha Token ...")
        const res = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${captchaToken}&remoteip=${remoteIp}`
        ).catch(function (error) {
            logger.error("ERROR VALIDATING RECAPTCHA TOKEN CHECK YOUR INTERNET CONNECTION");
            throw new ERRORS.InternalServerError(error);
        });;

        // Extract result from the API response
        if (res.data.success) {
            logger.info("SUCCESSFULLY VALIDATED RECAPTCHA TOKEN");
            return true;
        } else {
            logger.error("RECAPTCHA TOKEN VALIDATION FAILED");
            return false
        };
    } else {
        return true
    }
}