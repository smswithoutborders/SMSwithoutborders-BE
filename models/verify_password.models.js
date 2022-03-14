"use strict";

const ERRORS = require("../error.js");
const db = require("../schemas");
const Security = require("./security.models.js");
let logger = require("../logger");

var User = db.users;

module.exports = async (id, password) => {
    var security = new Security();

    // SEARCH FOR USER IN DB
    logger.debug(`Verifying Password for ${id}...`);
    let user = await User.findAll({
        where: {
            id: id,
            password: security.hash(password)
        }
    }).catch(error => {
        logger.error("ERROR VERIFYING PASSWORD");
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF USER IS NOT FOUND
    if (user.length < 1) {
        logger.error("INVALID PASSWORD");
        throw new ERRORS.Forbidden();
    }

    // IF MORE THAN ONE USER EXIST IN DATABASE
    if (user.length > 1) {
        logger.error("DUPLICATE USER FOUND");
        throw new ERRORS.Conflict();
    }

    logger.info("SUCCESSFULLY VERIFIED PASSWORD");
    return user[0];
}