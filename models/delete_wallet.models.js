"use strict";

const ERRORS = require("../error.js");
let logger = require("../logger");

module.exports = async (wallet) => {
    logger.debug(`Deleting token ...`);

    await wallet.destroy().catch(error => {
        logger.error("ERROR DELETING TOKEN");
        throw new ERRORS.InternalServerError(error);
    });

    logger.info(`SUCCESSFULLY DELETED TOKEN`);
}