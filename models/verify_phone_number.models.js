"use strict";

const ERRORS = require("../error.js");
const db = require("../schemas");
const Security = require("./security.models.js");
const config = require('config');
const SERVER_CFG = config.get("SERVER");
const KEY = SERVER_CFG.api.SECRET_KEY;
let logger = require("../logger");

let UserInfo = db.usersInfo;

module.exports = async (phone_number) => {
    let security = new Security(KEY);

    // SEARCH FOR USERINFO IN DB
    logger.debug(`Finding Phone number ${phone_number} ...`);
    let userInfo = await UserInfo.findAll({
        where: {
            full_phone_number: security.hash(phone_number),
            status: "verified"
        }
    }).catch(error => {
        logger.error("ERROR FINDING PHONE NUMBER");
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF PHONE NUMBER IS NOT FOUND
    if (userInfo.length < 1) {
        logger.error("NO PHONE NUMBER FOUND");
        throw new ERRORS.Forbidden();
    }

    // IF MORE THAN ONE PHONE NUMBER EXIST IN DATABASE
    if (userInfo.length > 1) {
        logger.error("DUPLICATE PHONE NUMBERS FOUND");
        throw new ERRORS.Conflict();
    };

    logger.debug(`Updating Phone number for ${userInfo[0].userId} ...`);
    await userInfo[0].update({
        full_phone_number: phone_number,
        status: "unverified"
    }).catch(error => {
        logger.error("ERROR UPDATING PHONE NUMBER");
        throw new ERRORS.InternalServerError(error);
    });

    logger.info("PHONE NUMBER SUCCESSFULLY VERIFIED");
    return userInfo[0].userId;
}