"use strict";

const ERRORS = require("../error.js");
const db = require("../schemas");
let logger = require("../logger");

var User = db.users;

module.exports = async (user) => {
    logger.debug(`Gathering data for ${user.id}...`);
    let userInfos = await user.getUsersInfo();

    logger.debug(`Deleting account ${user.id}...`);

    userInfos.destroy().catch(error => {
        logger.error("ERROR DELETING USERSINFO");
        throw new ERRORS.InternalServerError(error);
    });

    user.destroy().catch(error => {
        logger.error("ERROR DELETING USER");
        throw new ERRORS.InternalServerError(error);
    });

    logger.info(`SUCCESSFULLY DELETED ACCOUNT ${user.id}`);
    return true;
}