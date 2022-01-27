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
            PLATFORMS.unsaved_platforms.push(unsaved_platforms[i]);
        };
    };

    let tokens = await user.getTokens();

    if (tokens.length > 0) {
        for (let i = 0; i < tokens.length; i++) {
            let saved_platforms = await tokens[i].getPlatform();
            if (saved_platforms) {
                PLATFORMS.saved_platforms.push(saved_platforms);
            };
        };
    };

    console.log("RETURNING SAVED AND UNSAVED PLATFORMS");
    return PLATFORMS;
}