"use strict";

const ERRORS = require("../error.js");
const db = require("../schemas");
let logger = require("../logger");

var Wallet = db.wallets;

module.exports = async (user, platform) => {
    logger.debug(`Finding Wallet for ${user.id} ...`);

    // SEARCH FOR WALLET IN DB
    let wallet = await Wallet.findAll({
        where: {
            userId: user.id,
            platformId: platform.id
        }
    }).catch(error => {
        logger.error("ERROR FINDING WALLET");
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF WALLET IS NOT FOUND
    if (wallet.length < 1) {
        logger.error("NO WALLET FOUND");
        throw new ERRORS.NotFound();
    }

    // IF MORE THAN ONE WALLET EXIST IN DATABASE
    if (wallet.length > 1) {
        logger.error("DUPLICATE WALLET FOUND");
        throw new ERRORS.Conflict();
    }

    logger.info("WALLET FOUND");
    return wallet[0];
}