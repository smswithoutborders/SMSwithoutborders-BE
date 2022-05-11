"use strict";

const config = require('config');
const ERRORS = require("../error.js");
const Axios = require('axios');
const DEVELOPER = config.get("DEVELOPER");

let logger = require("../logger");

module.exports = async (unique_identifier, user_agent, cookie, verification_path) => {
    logger.debug(`Authenticating developer session for ${unique_identifier} ...`);

    let url = `${DEVELOPER.host}:${DEVELOPER.port}/${verification_path}`
    let result = await Axios.post(url, {
        uid: unique_identifier,
        user_agent: user_agent,
        cookie: cookie
    }).catch(function (error) {
        if (error.response.status == 400) {
            logger.error(error.message)
            throw new ERRORS.BadRequest(error.message)
        } else if (error.response.status == 401) {
            logger.error(error.message)
            throw new ERRORS.Unauthorized(error.message)
        } else if (error.response.status == 409) {
            logger.error(error.message)
            throw new ERRORS.Conflict(error.message)
        } else {
            throw new ERRORS.InternalServerError(error)
        }
    });

    if (result.status == 200) {
        logger.info("DEVELOPER SESSION SUCCESSFULLY AUTHENTICATED");
        return true;
    } else {
        throw new ERRORS.InternalServerError(result.message)
    }
}