"use strict";

const db = require("../schemas");
const ERRORS = require("../error.js");
let logger = require("../logger");
let generator = require('generate-password');

let MySQL = db.sequelize;
let SVRetry = db.svretries;
let QueryTypes = db.sequelize.QueryTypes;

const config = require('config');
const SERVER_CFG = config.get("SERVER");
const OTP_CFG = SERVER_CFG.otp;
const TIME1 = eval(OTP_CFG.first_resend_duration);
const TIME2 = eval(OTP_CFG.second_resend_duration);
const TIME3 = eval(OTP_CFG.third_resend_duration);
const TIME4 = eval(OTP_CFG.fourth_resend_duration);

let check = async (uniqueId, userId) => {
    const UNIQUE_ID = uniqueId;
    const USERID = userId;

    logger.debug(`Finding SMS resend record for ${USERID} using ${UNIQUE_ID} ...`)
    let counter = await SVRetry.findAll({
        where: {
            uniqueId: UNIQUE_ID,
            userId: USERID
        }
    }).catch(error => {
        logger.error("ERROR FINDING SMS RESEND RECORD")
        throw new ERRORS.InternalServerError(error);
    });

    if (counter.length < 1) {
        logger.debug(`Creating SMS resend record for ${USERID} using ${UNIQUE_ID} ...`);
        let new_counter = await SVRetry.create({
            uniqueId: UNIQUE_ID,
            userId: USERID,
            count: 0,
            expires: null
        }).catch(error => {
            logger.error("ERROR CREATING SMS RESEND RECORD")
            throw new ERRORS.InternalServerError(error);
        });;

        logger.info("SUCCESSFULLY CREATED SMS RESEND RECORD");
        return new_counter;
    };

    if (counter.length > 1) {
        logger.error("DUPLICATE SMS RESEND RECORDS FOUND");
        throw new ERRORS.Conflict();
    };

    logger.debug(`Checking sms resend count for ${USERID} using ${UNIQUE_ID} ...`);

    let expires = counter[0].expires;
    let age = expires - Date.now();

    if (age >= 0) {
        logger.error("TOO MANY REQUESTS");
        throw new ERRORS.TooManyRequests();
    };

    logger.info(`FOUND SMS RESEND RECORD`);
    return counter[0];
};

let add = async (counter) => {
    const UNIQUE_ID = counter.uniqueId;
    const USERID = counter.userId;
    const COUNT = counter.count;

    logger.debug(`Adding SMS resend record for ${USERID} using ${UNIQUE_ID} ...`)

    if (COUNT + 1 == 1) {
        let addedCount = await counter.update({
            count: COUNT + 1,
            expires: new Date(Date.now() + TIME1)
        });

        logger.info("SUCCESSFULLY ADDED SMS RESEND COUNT")
        return addedCount.expires;
    } else if (COUNT + 1 == 2) {
        let addedCount = await counter.update({
            count: COUNT + 1,
            expires: new Date(Date.now() + TIME2)
        });

        logger.info("SUCCESSFULLY ADDED SMS RESEND COUNT")
        return addedCount.expires;
    } else if (COUNT + 1 == 3) {
        let addedCount = await counter.update({
            count: COUNT + 1,
            expires: new Date(Date.now() + TIME3)
        });

        logger.info("SUCCESSFULLY ADDED SMS RESEND COUNT")
        return addedCount.expires;
    } else if (COUNT + 1 == 4) {
        logger.debug("Generating sms resend event code ...");
        let code = generator.generate({
            length: 5,
            numbers: true,
            symbols: false,
            lowercase: true,
            uppercase: true
        });

        let query = `CREATE EVENT IF NOT EXISTS ${code} ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL ${TIME4/60000} MINUTE DO UPDATE svretries SET count = ?, expires = ? WHERE uniqueId = ?, userId = ?;`
        await MySQL.query(query, {
            replacements: [0, null, UNIQUE_ID, USERID],
            type: QueryTypes.UPDATE
        }).catch(error => {
            throw new ERRORS.InternalServerError(error);
        });

        let addedCount = await counter.update({
            count: COUNT + 1,
            expires: new Date(Date.now() + TIME4)
        });

        logger.info("SUCCESSFULLY ADDED SMS RESEND COUNT")
        return addedCount.expires;
    }
};

let remove = async (cid) => {
    logger.debug(`Finding SMS resend record with ${cid} ...`)
    let counter = await SVRetry.findAll({
        where: {
            id: cid
        }
    }).catch(error => {
        logger.error("ERROR FINDING SMS RESEND RECORD")
        throw new ERRORS.InternalServerError(error);
    });

    if (counter.length < 1) {
        logger.error("NO SMS RESEND RECORDS FOUND");
        throw new ERRORS.Forbidden();
    };

    if (counter.length > 1) {
        logger.error("DUPLICATE SMS RESEND RECORDS FOUND");
        throw new ERRORS.Conflict();
    };

    const UNIQUE_ID = counter[0].uniqueId;
    const USERID = counter[0].userId;

    logger.debug(`Deleting sms resend count for ${USERID} using ${UNIQUE_ID} ...`)

    await counter[0].destroy();

    logger.info("SUCCESSFULLY REMOVED SMS RESEND COUNT");

    return {
        state: "success"
    }
};

module.exports = {
    check,
    add,
    remove
}