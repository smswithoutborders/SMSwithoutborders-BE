"use strict";

const ERRORS = require("../error.js");
const db = require("../schemas");
const config = require('config');
const Security = require("./security.models.js");
const SERVER_CFG = config.get("SERVER");
const KEY = SERVER_CFG.api.KEY;

let logger = require("../logger");

const User = db.users;
const UserInfo = db.usersInfo;

module.exports = async (country_code, phone_number, password, name) => {
    let security = new Security(KEY);

    logger.debug(`Creating User ${name} ...`);

    let newUser = await User.create({
        password: security.hash(password),
    }).catch(error => {
        logger.error("ERROR CREATING USER PASSWORD");
        if (error.name == "SequelizeUniqueConstraintError") {
            if (error.original.code == "ER_DUP_ENTRY") {
                logger.error("USER ALREADY HAS RECORD");
                throw new ERRORS.Conflict();
            };
        };

        throw new ERRORS.InternalServerError(error);
    });

    logger.debug(`Storing ${name}'s Info ...`);

    await UserInfo.create({
        phone_number: security.encrypt(phone_number).e_info,
        name: security.encrypt(name).e_info,
        country_code: security.encrypt(country_code).e_info,
        full_phone_number: security.hash(country_code + phone_number),
        userId: newUser.id,
        iv: security.iv
    }).catch(error => {
        logger.error("ERROR CREATING USERINFO");
        if (error.name == "SequelizeUniqueConstraintError") {
            logger.error("USERINFO ALREADY HAS RECORD");
            if (error.original.code == "ER_DUP_ENTRY") {
                throw new ERRORS.Conflict();
            };
        };

        throw new ERRORS.InternalServerError(error);
    });

    logger.info("SUCCESSFULLY STORED USER");
    return newUser.id;
}