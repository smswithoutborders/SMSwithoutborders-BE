"use strict";

const ERRORS = require("../error.js");
const db = require("../schemas");
let logger = require("../logger");

var Token = db.tokens;

module.exports = async (user, platform) => {
    logger.debug(`Finding Wallet for ${user.id} ...`);

    // SEARCH FOR TOKEN IN DB
    let token = await Token.findAll({
        where: {
            userId: user.id,
            platformId: platform.id
        }
    }).catch(error => {
        logger.error("ERROR FINDING WALLET");
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF TOKEN IS NOT FOUND
    if (token.length < 1) {
        logger.error("NO WALLET FOUND");
        throw new ERRORS.NotFound();
    }

    // IF MORE THAN ONE TOKEN EXIST IN DATABASE
    if (token.length > 1) {
        logger.error("DUPLICATE WALLET FOUND");
        throw new ERRORS.Conflict();
    }

    logger.info("WALLET FOUND");
    return token[0];
}