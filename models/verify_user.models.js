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
        logger.error("ERROR FINDING USER'S PHONE NUMBER");
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF USERINFO IS NOT FOUND
    if (userInfo.length < 1) {
        logger.error("INVALID PHONENUMBER");
        throw new ERRORS.Forbidden();
    }

    // IF MORE THAN ONE USERINFO EXIST IN DATABASE
    if (userInfo.length > 1) {
        logger.error("DUPLICATE PHONE NUMBERS FOUND");
        throw new ERRORS.Conflict();
    }

    logger.debug(`Verifying Password for ${phone_number} ...`);

    let user = await userInfo[0].getUser({
        where: {
            password: security.hash(password)
        }
    }).catch(error => {
        logger.error("ERROR FINDING USER'S PASSWORD");
        throw new ERRORS.InternalServerError(error);
    });

    if (!user) {
        logger.error("INVALID PASSWORD");
        throw new ERRORS.Forbidden();
    };

    logger.info("USER SUCCESSFULLY AUTHENTICATED");
    return user.id;
}