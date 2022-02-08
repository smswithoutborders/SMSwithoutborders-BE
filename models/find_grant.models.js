"use strict";

const ERRORS = require("../error.js");
const db = require("../schemas");
let logger = require("../logger");

var Wallet = db.wallets;

module.exports = async (user, platform) => {
    logger.debug(`Finding ${platform.id} grant for ${user.id} ...`);

    // SEARCH FOR GRANT IN DB
    let grant = await Wallet.findAll({
        where: {
            userId: user.id,
            platformId: platform.id
        }
    }).catch(error => {
        logger.error("ERROR FINDING GRANT");
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF GRANT IS NOT FOUND
    if (grant.length < 1) {
        logger.error("NO GRANT FOUND");
        throw new ERRORS.NotFound();
    }

    // IF MORE THAN ONE GRANT EXIST IN DATABASE
    if (grant.length > 1) {
        logger.error("DUPLICATE GRANT FOUND");
        throw new ERRORS.Conflict();
    }

    logger.info("GRANT FOUND");
    return grant[0];
}