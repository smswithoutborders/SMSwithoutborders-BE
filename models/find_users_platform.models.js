"use strict";

const db = require("../schemas");
let logger = require("../logger");

let MySQL = db.sequelize;
let QueryTypes = db.sequelize.QueryTypes

module.exports = async (user) => {
    const id = user.id;

    let PLATFORMS = {
        unsaved_platforms: [],
        saved_platforms: []
    };

    let query = `SELECT t1.*
                FROM platforms t1
                LEFT JOIN (SELECT * FROM wallets WHERE wallets.userId = "${id}") AS t2 
                ON t2.platformId = t1.id 
                WHERE t2.platformId IS NULL`

    logger.debug(`Fetching unsaved platforms for ${id} ...`);

    let unsaved_platforms = await MySQL.query(query, {
        type: QueryTypes.SELECT
    });

    if (unsaved_platforms.length > 0) {
        for (let i = 0; i < unsaved_platforms.length; i++) {
            let name = unsaved_platforms[i].name.toLowerCase();
            let protocol = JSON.parse(unsaved_platforms[i].protocols);

            PLATFORMS.unsaved_platforms.push({
                name: unsaved_platforms[i].name.toLowerCase(),
                description: {
                    en: unsaved_platforms[i].description_en,
                    fr: unsaved_platforms[i].description_fr
                },
                logo: unsaved_platforms[i].logo,
                initialization_url: `/platforms/${name}/protocols/${protocol[0]}`,
                type: unsaved_platforms[i].type.toLowerCase(),
                letter: unsaved_platforms[i].letter
            });
        };
    };

    logger.debug(`Fetching saved platforms for ${id} ...`);

    let grants = await user.getWallets();

    if (grants.length > 0) {
        for (let i = 0; i < grants.length; i++) {
            let saved_platforms = await grants[i].getPlatform();
            if (saved_platforms) {
                let name = saved_platforms.name.toLowerCase();
                let protocol = JSON.parse(saved_platforms.protocols);

                PLATFORMS.saved_platforms.push({
                    name: saved_platforms.name.toLowerCase(),
                    description: {
                        en: saved_platforms.description_en,
                        fr: saved_platforms.description_fr,
                    },
                    logo: saved_platforms.logo,
                    initialization_url: `/platforms/${name}/protocols/${protocol[0]}`,
                    type: saved_platforms.type.toLowerCase(),
                    letter: saved_platforms.letter
                });
            };
        };
    };

    logger.info("RETURNING SAVED AND UNSAVED PLATFORMS");
    return PLATFORMS;
}