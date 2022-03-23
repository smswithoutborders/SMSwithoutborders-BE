"use strict";

const config = require('config');
const ERRORS = require("../error.js");
const DEVELOPER = config.get("DEVELOPER");

const mysql = require('mysql2/promise');

let logger = require("../logger");

module.exports = async (sid, unique_identifier, user_agent, cookie, ext) => {
    logger.debug("connecting to SWOB Dev ...");
    // create the connection
    const connection = await mysql.createConnection({
        host: DEVELOPER.database.MYSQL_HOST,
        user: DEVELOPER.database.MYSQL_USER,
        database: DEVELOPER.database.MYSQL_DATABASE,
        password: DEVELOPER.database.MYSQL_PASSWORD
    });

    logger.info("SUCCESSFULLY CONNECTED TO SWOB DEV");

    logger.debug(`Finding ${unique_identifier}'s developer session with id ${sid}'`)
    // query database
    const [rows] = await connection.execute('SELECT * FROM `sessions` WHERE `sid` = ? AND `unique_identifier` = ? AND `user_agent` = ?', [sid, unique_identifier, user_agent]);

    if (rows.length < 1) {
        logger.error("NO DEV SESSION FOUND");
        throw new ERRORS.Unauthorized();
    };

    if (rows.length > 1) {
        logger.error("DUPLICATE DEV SESSION FOUND");
        throw new ERRORS.Conflict();
    };

    logger.debug(`Authenticating developer session ...`);

    const expires = rows[0].expires;

    let age = expires - Date.now();

    if (age <= 0) {
        logger.error("EXPIRED SESSION");
        throw new ERRORS.Unauthorized();
    }

    let str_cookie = ""
    if (ext == "py") {
        str_cookie = JSON.stringify(cookie).replaceAll("false", "False");
        str_cookie = str_cookie.replaceAll("true", "True");
        str_cookie = str_cookie.replaceAll(":", ": ");
        str_cookie = str_cookie.replaceAll(",", ", ");
        str_cookie = str_cookie.replaceAll("\"", "'");
    } else {
        str_cookie = JSON.stringify(cookie)
    }

    if (rows[0].data !== str_cookie) {
        logger.error("INVALID COOKIE");
        logger.error(`original cookie: ${rows[0].data}`)
        logger.error(`invalid cookie: ${str_cookie}`)
        throw new ERRORS.Unauthorized();
    }

    logger.info("DEVELOPER SESSION SUCCESSFULLY AUTHENTICATED");
    return rows[0];
}