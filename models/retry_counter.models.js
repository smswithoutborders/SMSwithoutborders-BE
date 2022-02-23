"use strict";

const db = require("../schemas");
const ERRORS = require("../error.js");
let logger = require("../logger");
let generator = require('generate-password');

let MySQL = db.sequelize;
let Retry = db.retries;
let QueryTypes = db.sequelize.QueryTypes;
const ATTEMPTS = 3;

let check = async (uniqueId) => {
    const UNIQUE_ID = uniqueId;

    logger.debug(`Finding retry record for ${UNIQUE_ID} ...`)
    let counter = await Retry.findAll({
        where: {
            uniqueId: UNIQUE_ID
        }
    });

    if (counter.length < 1) {
        logger.debug(`Creating retry record for ${UNIQUE_ID} ...`);
        let new_counter = await Retry.create({
            uniqueId: UNIQUE_ID,
            count: 0
        }).catch(error => {
            logger.error("ERROR CREATING RETRY RECORD")
            throw new ERRORS.InternalServerError(error);
        });;

        logger.info("SUCCESSFULLY CREATED RETRY RECORD");
        return new_counter;
    };

    if (counter.length > 1) {
        logger.error("DUPLICATE RETRY RECORDS FOUND");
        throw new ERRORS.Conflict();
    };

    logger.debug(`Checking retry count for ${UNIQUE_ID} ...`);

    if (counter[0].count >= ATTEMPTS) {
        throw new ERRORS.TooManyRequests();
    };

    logger.info(`FOUND RETRY RECORD. ${ATTEMPTS - counter[0].count} ATTEMPTS LEFT`);
    return counter[0];
};

let add = async (counter) => {
    const UNIQUE_ID = counter.uniqueId;

    if (counter.count + 1 == ATTEMPTS) {
        logger.debug("Generating retry event code ...");
        let code = generator.generate({
            length: 5,
            numbers: true,
            symbols: false,
            lowercase: true,
            uppercase: true
        });

        let query = `CREATE EVENT IF NOT EXISTS ${code} ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 1 MINUTE DO UPDATE retries SET count = ? WHERE uniqueId = ?;`
        await MySQL.query(query, {
            replacements: [0, UNIQUE_ID],
            type: QueryTypes.UPDATE
        }).catch(error => {
            throw new ERRORS.InternalServerError(error);
        });

        logger.info("SUCCESSFULLY CREATED RETRY EVENT")
    };

    logger.debug(`Adding retry count for ${UNIQUE_ID} ...`)

    await counter.update({
        count: counter.count + 1
    });

    logger.info("SUCCESSFULLY ADDED RETRY COUNT");
    return {
        state: "success"
    }
};

let remove = async (counter) => {
    const UNIQUE_ID = counter.uniqueId;

    logger.debug(`Deleting retry count for ${UNIQUE_ID} ...`)

    await counter.destroy();

    logger.info("SUCCESSFULLY REMOVED RETRY COUNT");

    return {
        state: "success"
    }
};

module.exports = {
    check,
    add,
    remove
}