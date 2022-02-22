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
        logger.debug(`Creating retry record ${UNIQUE_ID} ...`);
        let new_counter = await count.update({
            uniqueId: UNIQUE_ID,
            count: 0
        });

        logger.info("SUCCESSFULLY CREATED RETRY RECORD");
        return new_counter;
    };

    if (counter.length > 1) {
        logger.error("DUPLICATE RETRY RECORDS FOUND");
        throw new ERRORS.Conflict();
    };

    logger.debug(`Checking retry count for ${UNIQUE_ID} ...`)
    if (counter[0].count + 1 == ATTEMPTS) {
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

    if (counter[0].count >= ATTEMPTS) {
        throw new ERRORS.TooManyRequests();
    };

    logger.info(`FOUND RETRY RECORD. ${ATTEMPTS - counter[0].count} ATTEMPTS LEFT`);
    return counter[0];
};

let add = async (counter) => {
    const UNIQUE_ID = counter.uniqueId;

    await check(UNIQUE_ID);

    logger.debug(`Adding retry count for ${UNIQUE_ID} ...`)

    await counter[0].update({
        count: counter[0].count + 1
    });

};