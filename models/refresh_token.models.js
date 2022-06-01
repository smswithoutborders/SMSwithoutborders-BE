"use strict";

const config = require('config');
const credentials = config.get("CREDENTIALS");
let logger = require("../logger");

const ERRORS = require("../error.js");

const TWITTER = require("../libs/platforms/TWITTER");

const twitter_token_scopes = [
    "tweet.write",
    "users.read",
    "tweet.read",
    "offline.access"
];

module.exports = async (token, platform) => {
    if (platform.name == "twitter") {
        let platformObj = new TWITTER.OAuth2(credentials, twitter_token_scopes);

        logger.debug(`Refreshing ${platform.name} token ...`);

        let refreshed_token = await platformObj.refresh(token).catch(err => {
            logger.error(`Failed refreshing ${platform.name} token`);
            throw new ERRORS.InternalServerError(err);
        });

        logger.info(`SUCCESSFULLY REFRESHED TOKEN`);
        return refreshed_token
    }
    
    logger.error("INVALID PLATFORM REFRESH REQUEST")
}