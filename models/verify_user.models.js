"use strict";

const ERRORS = require("../error.js");
const db = require("../schemas");
const Security = require("./security.models.js");
const config = require('config');
const SERVER_CFG = config.get("SERVER");
const KEY = SERVER_CFG.api.SECRET_KEY;
let logger = require("../logger");

let UserInfo = db.usersInfo;

module.exports = async (phone_number, password) => {
    let security = new Security(KEY);

    // SEARCH FOR USERINFO IN DB
    logger.debug(`Finding Phone number ${phone_number} ...`);
    let userInfo = await UserInfo.findAll({
        where: {
            full_phone_number: security.hash(phone_number),
            status: "verified"
        }
    }).catch(error => {
        logger.error("ERROR FINDING USERINFO");
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF USERINFO IS NOT FOUND
    if (userInfo.length < 1) {
        logger.error("NO USERINFO FOUND");
        throw new ERRORS.Unauthorized();
    }

    // IF MORE THAN ONE USERINFO EXIST IN DATABASE
    if (userInfo.length > 1) {
        logger.error("DUPLICATE USERINFO FOUND");
        throw new ERRORS.Conflict();
    }

    logger.debug(`Verifying Password for ${phone_number} ...`);

    let user = await userInfo[0].getUser({
        where: {
            password: security.hash(password)
        }
    }).catch(error => {
        logger.error("ERROR FINDING USER");
        throw new ERRORS.InternalServerError(error);
    });

    if (!user) {
        logger.error("NO USER FOUND");
        throw new ERRORS.Unauthorized();
    };

    logger.info("USER SUCCESSFULLY AUTHENTICATED");
    return user.id;
}