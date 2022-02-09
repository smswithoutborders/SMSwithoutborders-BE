"use strict";

const config = require('config');
const credentials = config.get("CREDENTIALS");
let logger = require("../logger");

const ERRORS = require("../error.js");
const gmail_token_scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

const GMAIL = require("../libs/platforms/GMAIL");
const TWITTER = require("../libs/platforms/TWITTER");
const TELEGRAM = require("../libs/platforms/TELEGRAM");

const DECRYPT_GRANTS = require("./decrypt_grant.models");

module.exports = async (ORIGINALURL, PLATFORM, GRANT, USER) => {
    const originalURL = ORIGINALURL;
    const platform = PLATFORM.toLowerCase();

    if (platform == "gmail") {

        let platformObj = new GMAIL.OAuth2(credentials, gmail_token_scopes);

        const DECRYPTED_GRANT = await DECRYPT_GRANTS(GRANT, USER);
        const TOKEN = DECRYPTED_GRANT.token

        logger.debug(`Revoking ${platform} grant ...`);
        await platformObj.revoke(originalURL, TOKEN).catch(err => {
            if (err.message == "invalid_token") {
                logger.error(err)
            } else {
                logger.error(`Error revoking ${platform} grant`);
                throw new ERRORS.InternalServerError(err);
            };
        });

        logger.info(`SUCCESFULLY REVOKED ${platform} GRANT`)
        return GRANT;
    };

    if (platform == "twitter") {

        let platformObj = new TWITTER.OAuth(credentials);

        const DECRYPTED_GRANT = await DECRYPT_GRANTS(GRANT, USER);
        const TOKEN = DECRYPTED_GRANT.token

        logger.debug(`Revoking ${platform} grant ...`);
        await platformObj.revoke(originalURL, TOKEN).catch(err => {
            if (err.statusCode == 401) {
                logger.error(err.data)
            } else {
                logger.error(`Error revoking ${platform} grant`);
                throw new ERRORS.InternalServerError(err);
            };
        });

        logger.info(`SUCCESFULLY REVOKED ${platform} GRANT`)
        return GRANT;
    };

    if (platform == "telegram") {

        let platformObj = new TELEGRAM.twoFactor(credentials);

        const DECRYPTED_GRANT = await DECRYPT_GRANTS(GRANT, USER);
        const TOKEN = DECRYPTED_GRANT.token

        logger.debug(`Revoking ${platform} grant ...`);
        await platformObj.revoke(originalURL, TOKEN).catch(err => {
            logger.error(`Error revoking ${platform} grant`);
            throw new ERRORS.InternalServerError(err);
        });

        logger.info(`SUCCESFULLY REVOKED ${platform} GRANT`)
        return GRANT;
    };

    logger.error("INVALID PLATFORM")
    throw new ERRORS.NotFound();
}