const db = require("../schemas");

let MySQL = db.sequelize;
let QueryTypes = db.sequelize.QueryTypes

module.exports = async (user) => {
    const id = user.id;

    // store tokens from db
    let PLATFORMS = {
        unsaved_platforms: [],
        saved_platforms: []
    };

    let query = `SELECT t1.*
                FROM platforms t1
                LEFT JOIN (SELECT * FROM tokens WHERE tokens.userId = "${id}") AS t2 
                ON t2.platformId = t1.id 
                WHERE t2.platformId IS NULL`

    let unsaved_platforms = await MySQL.query(query, {
        type: QueryTypes.SELECT
    });

    if (unsaved_platforms.length > 0) {
        for (let i = 0; i < unsaved_platforms.length; i++) {
            PLATFORMS.unsaved_platforms.push({
                name: unsaved_platforms[i].name.toLowerCase(),
                description: unsaved_platforms[i].description.toLowerCase(),
                logo: unsaved_platforms[i].logo,
                protocols: JSON.parse(unsaved_platforms[i].protocols),
                type: unsaved_platforms[i].type.toLowerCase(),
                letter: unsaved_platforms[i].name.toLowerCase()[0]
            });
        };
    };

    let tokens = await user.getTokens();

    if (tokens.length > 0) {
        for (let i = 0; i < tokens.length; i++) {
            let saved_platforms = await tokens[i].getPlatform();
            if (saved_platforms) {
                PLATFORMS.saved_platforms.push({
                    name: saved_platforms.name.toLowerCase(),
                    description: saved_platforms.description.toLowerCase(),
                    logo: saved_platforms.logo,
                    protocols: JSON.parse(saved_platforms.protocols),
                    type: saved_platforms.type.toLowerCase(),
                    letter: saved_platforms.name.toLowerCase()[0]
                });
            };
        };
    };

    console.log("RETURNING SAVED AND UNSAVED PLATFORMS");
    return PLATFORMS;
}