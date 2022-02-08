"use strict";

const ERRORS = require("../error.js");
let logger = require("../logger");

module.exports = async (grant) => {
    logger.debug(`Deleting grant ...`);

    await grant.destroy().catch(error => {
        logger.error("ERROR DELETING GRANT");
        throw new ERRORS.InternalServerError(error);
    });

    logger.info(`SUCCESSFULLY DELETED GRANT`);
}