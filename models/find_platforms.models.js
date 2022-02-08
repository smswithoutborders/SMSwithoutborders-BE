"use strict";

const ERRORS = require("../error.js");
const db = require("../schemas");
let logger = require("../logger");

var Platform = db.platforms;

module.exports = async (platform_name) => {
    // SEARCH FOR PLATFORM IN DB
    logger.debug(`Finding Platform ${platform_name} ...`);
    let platform = await Platform.findAll({
        where: {
            name: platform_name.toLowerCase()
        }
    }).catch(error => {
        logger.error("ERROR FINDING PLATFORM");
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF PLATFORM IS NOT FOUND
    if (platform.length < 1) {
        logger.error("NO PLATFORM FOUND");
        throw new ERRORS.Forbidden();
    }

    // IF MORE THAN ONE PLATFORM EXIST IN DATABASE
    if (platform.length > 1) {
        logger.error("DUPLICATE PLATFORM FOUND");
        throw new ERRORS.Conflict();
    };

    logger.info("PLATFORM FOUND");
    return platform[0];
}