"use strict";

const db = require("../schemas");
const ERRORS = require("../error.js");
let logger = require("../logger");

let Retry = db.retries;

const config = require('config');
const SERVER_CFG = config.get("SERVER");
const ATTEMPTS = SERVER_CFG.api.short_block_attempts;
const BLOCKS = SERVER_CFG.api.long_block_attempts;
const ATTEMPTS_TIME = SERVER_CFG.api.short_block_duration * 60000;
const BLOCKS_TIME = SERVER_CFG.api.long_block_duration * 60000;

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
            count: 0,
            block: 0
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

    let expires = counter[0].expires;
    let age = expires - Date.now();

    if (counter[0].count >= ATTEMPTS && age >= 0) {
        logger.error("TOO MANY REQUESTS");
        throw new ERRORS.TooManyRequests();
    } else if (counter[0].count >= ATTEMPTS && age < 0) {
        logger.debug(`Resetting retry count for ${UNIQUE_ID} ...`)

        let resetCount = await counter[0].update({
            count: 0
        });

        logger.info(`SUCCESSFULLY RESET COUNT. ${ATTEMPTS - resetCount.count} ATTEMPTS LEFT. ${BLOCKS - resetCount.block} BLOCKS LEFT`);
    }
    if (counter[0].block >= BLOCKS && age >= 0) {
        logger.error("TOO MANY REQUESTS");
        throw new ERRORS.TooManyRequests();
    } else if (counter[0].block >= BLOCKS && age < 0) {
        logger.debug(`Resetting retry count for ${UNIQUE_ID} ...`)

        let resetCount = await counter[0].update({
            block: 0
        });

        logger.info(`SUCCESSFULLY RESET BLOCK. ${ATTEMPTS - resetCount.count} ATTEMPTS LEFT. ${BLOCKS - resetCount.block} BLOCKS LEFT`);
    }

    logger.info(`FOUND RETRY RECORD`);
    return counter[0];
};

let add = async (counter) => {
    const UNIQUE_ID = counter.uniqueId;

    logger.debug(`Adding retry count for ${UNIQUE_ID} ...`)

    if (counter.count + 1 == ATTEMPTS && counter.block + 1 == BLOCKS) {
        let addedCount = await counter.update({
            count: counter.count + 1,
            block: counter.block + 1,
            expires: new Date(Date.now() + BLOCKS_TIME)
        });

        logger.info(`SUCCESSFULLY ADDED RETRY COUNT. ${ATTEMPTS - addedCount.count} ATTEMPTS LEFT. ${BLOCKS - addedCount.block} BLOCKS LEFT`);
    } else if (counter.count + 1 == ATTEMPTS && counter.block < BLOCKS) {
        let addedCount = await counter.update({
            count: counter.count + 1,
            block: counter.block + 1,
            expires: new Date(Date.now() + ATTEMPTS_TIME)
        });

        logger.info(`SUCCESSFULLY ADDED RETRY COUNT. ${ATTEMPTS - addedCount.count} ATTEMPTS LEFT. ${BLOCKS - addedCount.block} BLOCKS LEFT`);
    } else if (counter.count + 1 < ATTEMPTS && counter.block < BLOCKS) {
        let addedCount = await counter.update({
            count: counter.count + 1
        });

        logger.info(`SUCCESSFULLY ADDED RETRY COUNT. ${ATTEMPTS - addedCount.count} ATTEMPTS LEFT. ${BLOCKS - addedCount.block} BLOCKS LEFT`);
    }

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