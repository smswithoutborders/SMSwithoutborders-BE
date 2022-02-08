"use strict";

const ERRORS = require("../error.js");
const db = require("../schemas");
let logger = require("../logger");

var User = db.users;

module.exports = async (id) => {
    // SEARCH FOR USER IN DB
    logger.debug(`Finding User ${id} ...`);
    let user = await User.findAll({
        where: {
            id: id
        }
    }).catch(error => {
        logger.error("ERROR FINDING USER");
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF USER IS NOT FOUND
    if (user.length < 1) {
        logger.error("NO USER FOUND");
        throw new ERRORS.Forbidden();
    }

    // IF MORE THAN ONE USER EXIST IN DATABASE
    if (user.length > 1) {
        logger.error("DUPLICATE USER FOUND");
        throw new ERRORS.Conflict();
    }

    logger.info("USER FOUND");
    return user[0];
}