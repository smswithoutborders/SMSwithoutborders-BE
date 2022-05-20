"use strict";

const config = require('config');
const credentials = config.get("CREDENTIALS");
let logger = require("../../logger");

const ERRORS = require("../../error.js");
const gmail_token_scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

const twitter_token_scopes = [
    "tweet.write",
    "users.read",
    "tweet.read",
    "offline.access"
];

const GMAIL = require("./GMAIL");
const TWITTER = require("./TWITTER");
const TELEGRAM = require("./TELEGRAM");

const FIND_GRANTS = require("../../models/find_grant.models");
const FIND_PLATFORMS = require("../../models/find_platforms.models");
const DECRYPT_GRANTS = require("../../models/decrypt_grant.models");
const FIND_SESSION = require("../../models/find_sessions.models");
const VERIFY_PASSWORDS = require("../../models/verify_password.models");

const {
    validationResult
} = require('express-validator');


// HTTP response status codes
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#information_responses

module.exports = async (req, res, next) => {
    try {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().map(err => {
                if (err.param == "SWOB") {
                    logger.error(`${err.param}: ${err.msg}`);
                    throw new ERRORS.Unauthorized();
                }
                logger.error(`${err.param}: ${err.msg}`);
            });
            throw new ERRORS.BadRequest();
        }
        // =============================================================

        const originalURL = req.header("Origin");
        const platform = req.params.platform.toLowerCase();
        const protocol = req.params.protocol.toLowerCase();
        const action = req.params.action ? req.params.action.toLowerCase() : "";

        if (platform == "gmail") {

            if (protocol == "oauth2") {
                let platformObj = new GMAIL.OAuth2(credentials, gmail_token_scopes);

                if (req.method.toLowerCase() == "post") {
                    const SID = req.cookies.SWOB.sid;
                    const UID = req.params.user_id;
                    const COOKIE = req.cookies.SWOB.cookie;
                    const USER_AGENT = req.get("user-agent");

                    await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);

                    let url = await platformObj.init(originalURL);
                    req.platformRes = {
                        url: url
                    }
                    return next();
                }

                if (req.method.toLowerCase() == "put") {
                    // ==================== REQUEST BODY CHECKS ====================
                    if (!req.body.code) {
                        logger.error("NO CODE");
                        throw new ERRORS.BadRequest();
                    };
                    // =============================================================

                    const SID = req.cookies.SWOB.sid;
                    const UID = req.params.user_id;
                    const COOKIE = req.cookies.SWOB.cookie;
                    const USER_AGENT = req.get("user-agent");

                    await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);

                    // INFO - Google API returns a UTF-8 encoded verification code on second request of OAuth2 token
                    // INFO - Google API Client requires a non UTF-8 verification code, so we decode every verification code entry at API level  
                    // TODO Try checking double attempt to store tokens from the diff in auth_code
                    const AUTH_CODE = decodeURIComponent(req.body.code);

                    let result = await platformObj.validate(originalURL, AUTH_CODE);
                    req.platformRes = {
                        result: result
                    };
                    return next();
                };

                if (req.method.toLowerCase() == "delete") {
                    // ==================== REQUEST BODY CHECKS ====================
                    if (!req.body.password) {
                        logger.error("NO PASSWORD");
                        throw new ERRORS.BadRequest();
                    };
                    // =============================================================

                    const SID = req.cookies.SWOB.sid;
                    const UID = req.params.user_id;
                    const PASSWORD = req.body.password;
                    const COOKIE = req.cookies.SWOB.cookie;
                    const USER_AGENT = req.get("user-agent");

                    const ID = await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);
                    const USER = await VERIFY_PASSWORDS(ID, PASSWORD);
                    const PLATFORM = await FIND_PLATFORMS(platform);
                    const GRANT = await FIND_GRANTS(USER, PLATFORM);
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
                    req.platformRes = {
                        grant: GRANT
                    };
                    return next();
                };

                logger.error("INVALID METHOD")
                throw new ERRORS.BadRequest();
            };

            logger.error("INVALID PROTOCOL")
            throw new ERRORS.BadRequest();
        };

        if (platform == "twitter") {

            if (protocol == "oauth2") {
                let platformObj = new TWITTER.OAuth2(credentials, twitter_token_scopes);

                if (req.method.toLowerCase() == "post") {
                    const SID = req.cookies.SWOB.sid;
                    const UID = req.params.user_id;
                    const COOKIE = req.cookies.SWOB.cookie;
                    const USER_AGENT = req.get("user-agent");

                    await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);

                    let {
                        url,
                        codeVerifier
                    } = await platformObj.init(originalURL).catch(err => {
                        logger.error(`Error initialising ${platform} grant`);
                        logger.error(err.data.error_description)
                        throw new ERRORS.InternalServerError(err);
                    });

                    req.platformRes = {
                        url: url,
                        codeVerifier: codeVerifier
                    }
                    return next();
                }

                if (req.method.toLowerCase() == "put") {
                    // ==================== REQUEST BODY CHECKS ====================
                    if (!req.body.code) {
                        logger.error("NO CODE");
                        throw new ERRORS.BadRequest();
                    };
                    // =============================================================

                    const SID = req.cookies.SWOB.sid;
                    const UID = req.params.user_id;
                    const COOKIE = req.cookies.SWOB.cookie;
                    const USER_AGENT = req.get("user-agent");

                    await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);

                    const AUTH_CODE = req.body.code;
                    const CODE_VERIFIER = req.cookies.SWOB.codeVerifier;

                    let result = await platformObj.validate(originalURL, AUTH_CODE, CODE_VERIFIER).catch(err => {
                        logger.error(`Error validating ${platform} grant`);
                        logger.error(err.data.error_description)
                        throw new ERRORS.InternalServerError(err);
                    });

                    req.platformRes = {
                        result: result
                    };
                    return next();
                };

                if (req.method.toLowerCase() == "delete") {
                    // ==================== REQUEST BODY CHECKS ====================
                    if (!req.body.password) {
                        logger.error("NO PASSWORD");
                        throw new ERRORS.BadRequest();
                    };
                    // =============================================================

                    const SID = req.cookies.SWOB.sid;
                    const UID = req.params.user_id;
                    const PASSWORD = req.body.password;
                    const COOKIE = req.cookies.SWOB.cookie;
                    const USER_AGENT = req.get("user-agent");

                    const ID = await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);
                    const USER = await VERIFY_PASSWORDS(ID, PASSWORD);
                    const PLATFORM = await FIND_PLATFORMS(platform);
                    const GRANT = await FIND_GRANTS(USER, PLATFORM);
                    const DECRYPTED_GRANT = await DECRYPT_GRANTS(GRANT, USER);
                    const TOKEN = DECRYPTED_GRANT.token

                    await platformObj.revoke(TOKEN).catch(err => {
                        if (err.code == 401) {
                            logger.error(`Error revoking ${platform} grant`);
                            logger.error(err.data.error_description)
                        } else if (err.code == 400) {
                            logger.error(`Error revoking ${platform} grant`);
                            logger.error(err.data.error_description)
                        } else {
                            logger.error(`Error revoking ${platform} grant`);
                            throw new ERRORS.InternalServerError(err);
                        };
                    });

                    req.platformRes = {
                        grant: GRANT
                    };
                    return next();
                };

                logger.error("INVALID METHOD")
                throw new ERRORS.BadRequest();
            };

            logger.error("INVALID PROTOCOL")
            throw new ERRORS.BadRequest();
        };

        if (platform == "telegram") {

            if (protocol == "twofactor") {
                let platformObj = new TELEGRAM.twoFactor(credentials);

                if (req.method.toLowerCase() == "post") {
                    // ==================== REQUEST BODY CHECKS ====================
                    if (!req.body.phone_number) {
                        throw new ERRORS.BadRequest();
                    };
                    // =============================================================

                    const SID = req.cookies.SWOB.sid;
                    const UID = req.params.user_id;
                    const COOKIE = req.cookies.SWOB.cookie;
                    const USER_AGENT = req.get("user-agent");

                    await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);

                    let phoneNumber = req.body.phone_number;

                    let result = await platformObj.init(phoneNumber);
                    let code = result.status;

                    // if (code == 200) {
                    //     throw new ERRORS.Conflict();
                    // };

                    req.platformRes = {
                        body: code
                    }
                    return next();
                };

                if (req.method.toLowerCase() == "put") {
                    if (action == "register") {
                        // ==================== REQUEST BODY CHECKS ====================
                        if (!req.body.phone_number) {
                            logger.error("NO PHONE NUMBER");
                            throw new ERRORS.BadRequest();
                        };

                        if (!req.body.first_name) {
                            logger.error("NO FIRST NAME");
                            throw new ERRORS.BadRequest();
                        };

                        if (!req.body.last_name) {
                            logger.error("NO LAST NAME");
                            throw new ERRORS.BadRequest();
                        };
                        // =============================================================

                        const SID = req.cookies.SWOB.sid;
                        const UID = req.params.user_id;
                        const COOKIE = req.cookies.SWOB.cookie;
                        const USER_AGENT = req.get("user-agent");

                        await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);

                        let phoneNumber = req.body.phone_number;
                        let firstName = req.body.first_name;
                        let lastName = req.body.last_name;

                        let result = await platformObj.register(phoneNumber, firstName, lastName);
                        let status = result.status;

                        if (status == 200) {
                            const phonenumber = result.phonenumber;

                            req.platformRes = {
                                result: phonenumber
                            };

                            return next();
                        };
                    };

                    // ==================== REQUEST BODY CHECKS ====================
                    if (!req.body.phone_number) {
                        logger.error("NO PHONE NUMBER");
                        throw new ERRORS.BadRequest();
                    };

                    if (!req.body.code) {
                        logger.error("NO CODE");
                        throw new ERRORS.BadRequest();
                    };
                    // =============================================================

                    const SID = req.cookies.SWOB.sid;
                    const UID = req.params.user_id;
                    const COOKIE = req.cookies.SWOB.cookie;
                    const USER_AGENT = req.get("user-agent");

                    await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);

                    const PHONE_NUMBER = req.body.phone_number;
                    const AUTH_CODE = req.body.code;

                    let result = await platformObj.validate(PHONE_NUMBER, AUTH_CODE);
                    let status = result.status;

                    if (status == 200) {
                        const phonenumber = result.phonenumber;

                        req.platformRes = {
                            result: phonenumber
                        };

                        return next();
                    };

                    if (status == 403) {
                        throw new ERRORS.Forbidden();
                    };

                    if (status == 202) {
                        let code = status;

                        req.platformRes = {
                            body: code,
                            initialization_url: `/platforms/${platform}/protocols/${protocol}/register`,
                        };

                        return next();
                    };
                };

                if (req.method.toLowerCase() == "delete") {
                    // ==================== REQUEST BODY CHECKS ====================
                    if (!req.body.password) {
                        logger.error("NO PASSWORD");
                        throw new ERRORS.BadRequest();
                    };
                    // =============================================================

                    const SID = req.cookies.SWOB.sid;
                    const UID = req.params.user_id;
                    const PASSWORD = req.body.password;
                    const COOKIE = req.cookies.SWOB.cookie;
                    const USER_AGENT = req.get("user-agent");

                    const ID = await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);
                    const USER = await VERIFY_PASSWORDS(ID, PASSWORD);
                    const PLATFORM = await FIND_PLATFORMS(platform);
                    const GRANT = await FIND_GRANTS(USER, PLATFORM);
                    const DECRYPTED_GRANT = await DECRYPT_GRANTS(GRANT, USER);
                    const TOKEN = DECRYPTED_GRANT.token

                    let result = await platformObj.revoke(TOKEN);
                    let status = result.status;

                    if (status == 200) {
                        req.platformRes = {
                            grant: GRANT
                        };
                        return next();
                    };
                };

                logger.error("INVALID METHOD")
                throw new ERRORS.BadRequest();
            };

            logger.error("INVALID PROTOCOL")
            throw new ERRORS.BadRequest();
        };

        logger.error("INVALID PLATFORM")
        throw new ERRORS.NotFound();
    } catch (err) {
        if (err instanceof ERRORS.BadRequest) {
            return res.status(400).send(err.message);
        } // 400

        if (err instanceof ERRORS.NotFound) {
            return res.status(404).send(err.message);
        } // 404

        if (err instanceof ERRORS.Forbidden) {
            return res.status(403).send(err.message);
        } // 403

        if (err instanceof ERRORS.Unauthorized) {
            return res.status(401).send(err.message);
        } // 401

        if (err instanceof ERRORS.Conflict) {
            return res.status(409).send(err.message);
        } // 409

        logger.error(err);
        return res.status(500).send("internal server error");
    };
}