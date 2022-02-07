const config = require('config');
const credentials = config.get("CREDENTIALS");
let logger = require("../../logger");

const ERRORS = require("../../error.js");
const gmail_token_scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

const GMAIL = require("./GMAIL");
const TWITTER = require("./TWITTER");
const TELEGRAM = require("./TELEGRAM");

const FIND_USERS = require("../../models/find_users.models");
const FIND_WALLETS = require("../../models/find_wallet.models");
const FIND_PLATFORMS = require("../../models/find_platforms.models");
const DECRYPT_WALLETS = require("../../models/decrypt_wallet.models");
const FIND_SESSION = require("../../models/find_sessions.models");
const VERIFY_PASSWORDS = require("../../models/verify_password.models");

// HTTP response status codes
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#information_responses

module.exports = async (req, res, next) => {
    try {
        const originalURL = req.header("Origin");
        const platform = req.params.platform.toLowerCase();
        const protocol = req.params.protocol.toLowerCase();
        const action = req.params.action ? req.params.action.toLowerCase() : "";

        if (platform == "gmail") {

            if (protocol == "oauth2") {
                let platformObj = new GMAIL.OAuth2(credentials, gmail_token_scopes);

                if (req.method.toLowerCase() == "post") {
                    if (!req.params.user_id) {
                        logger.error("NO USERID");
                        throw new ERRORS.BadRequest();
                    }
                    if (!req.cookies.SWOB) {
                        logger.error("NO COOKIE");
                        throw new ERRORS.Forbidden();
                    };

                    const SID = req.cookies.SWOB.sid;
                    const UID = req.params.user_id;
                    const COOKIE = req.cookies.SWOB.cookie;
                    const USER_AGENT = req.get("user-agent");

                    await FIND_SESSION(SID, UID, USER_AGENT, COOKIE);

                    let url = await platformObj.init(originalURL);
                    req.platformRes = {
                        url: url
                    }
                    return next();
                }

                if (req.method.toLowerCase() == "put") {
                    if (!req.params.user_id) {
                        logger.error("NO USERID");
                        throw new ERRORS.BadRequest();
                    }
                    if (!req.cookies.SWOB) {
                        logger.error("NO COOKIE");
                        throw new ERRORS.Forbidden();
                    };

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

                    await FIND_SESSION(SID, UID, USER_AGENT, COOKIE);

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
                    if (!req.params.user_id) {
                        logger.error("NO USERID");
                        throw new ERRORS.BadRequest();
                    }
                    if (!req.cookies.SWOB) {
                        logger.error("NO COOKIE");
                        throw new ERRORS.Forbidden();
                    };

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

                    const ID = await FIND_SESSION(SID, UID, USER_AGENT, COOKIE);
                    await VERIFY_PASSWORDS(ID, PASSWORD);
                    const USER = await FIND_USERS(ID);
                    const PLATFORM = await FIND_PLATFORMS(platform);
                    const WALLET = await FIND_WALLETS(USER, PLATFORM);
                    const DECRYPTED_WALLET = await DECRYPT_WALLETS(WALLET, USER);
                    const TOKEN = DECRYPTED_WALLET.token

                    let result = await platformObj.revoke(originalURL, TOKEN);

                    if (result) {
                        req.platformRes = {
                            wallet: WALLET
                        };
                        return next();
                    }
                };

                throw new ERRORS.BadRequest();
            };

            throw new ERRORS.NotFound();
        };

        if (platform == "twitter") {

            if (protocol == "oauth") {
                let platformObj = new TWITTER.OAuth(credentials);

                if (req.method.toLowerCase() == "post") {
                    if (!req.params.user_id) {
                        logger.error("NO USERID");
                        throw new ERRORS.BadRequest();
                    }
                    if (!req.cookies.SWOB) {
                        logger.error("NO COOKIE");
                        throw new ERRORS.Forbidden();
                    };

                    let url = await platformObj.init(originalURL);
                    req.platformRes = {
                        url: url.url
                    }
                    return next();
                }

                if (req.method.toLowerCase() == "put") {
                    if (!req.params.user_id) {
                        logger.error("NO USERID");
                        throw new ERRORS.BadRequest();
                    }
                    if (!req.cookies.SWOB) {
                        logger.error("NO COOKIE");
                        throw new ERRORS.Forbidden();
                    };

                    // ==================== REQUEST BODY CHECKS ====================
                    if (!req.body.oauth_token) {
                        throw new ERRORS.BadRequest();
                    };

                    if (!req.body.oauth_verifier) {
                        throw new ERRORS.BadRequest();
                    };
                    // =============================================================

                    const AUTH_TOKEN = req.body.oauth_token;
                    const AUTH_VERIFIER = req.body.oauth_verifier;

                    let result = await platformObj.validate(originalURL, AUTH_TOKEN, AUTH_VERIFIER);
                    req.platformRes = {
                        result: result
                    };
                    return next();
                };

                if (req.method.toLowerCase() == "delete") {
                    if (!req.params.user_id) {
                        logger.error("NO USERID");
                        throw new ERRORS.BadRequest();
                    }
                    if (!req.cookies.SWOB) {
                        logger.error("NO COOKIE");
                        throw new ERRORS.Forbidden();
                    };

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

                    const ID = await FIND_SESSION(SID, UID, USER_AGENT, COOKIE);
                    await VERIFY_PASSWORDS(ID, PASSWORD);
                    const USER = await FIND_USERS(ID);
                    const PLATFORM = await FIND_PLATFORMS(platform);
                    const WALLET = await FIND_WALLETS(USER, PLATFORM);
                    const DECRYPTED_WALLET = await DECRYPT_WALLETS(WALLET, USER);
                    const TOKEN = DECRYPTED_WALLET.token

                    let result = await platformObj.revoke(originalURL, TOKEN);

                    if (result) {
                        req.platformRes = {
                            wallet: WALLET
                        };
                        return next();
                    }
                };

                throw new ERRORS.BadRequest();
            };

            throw new ERRORS.NotFound();
        };

        if (platform == "telegram") {

            if (protocol == "twofactor") {
                let platformObj = new TELEGRAM.twoFactor(credentials);

                if (req.method.toLowerCase() == "post") {
                    if (!req.params.user_id) {
                        logger.error("NO USERID");
                        throw new ERRORS.BadRequest();
                    }
                    if (!req.cookies.SWOB) {
                        logger.error("NO COOKIE");
                        throw new ERRORS.Forbidden();
                    };

                    // ==================== REQUEST BODY CHECKS ====================
                    if (!req.body.phone_number) {
                        throw new ERRORS.BadRequest();
                    };
                    // =============================================================

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
                        if (!req.params.user_id) {
                            logger.error("NO USERID");
                            throw new ERRORS.BadRequest();
                        }
                        if (!req.cookies.SWOB) {
                            logger.error("NO COOKIE");
                            throw new ERRORS.Forbidden();
                        };

                        // ==================== REQUEST BODY CHECKS ====================
                        if (!req.body.phone_number) {
                            throw new ERRORS.BadRequest();
                        };

                        if (!req.body.first_name) {
                            throw new ERRORS.BadRequest();
                        };

                        if (!req.body.last_name) {
                            throw new ERRORS.BadRequest();
                        };
                        // =============================================================

                        let phoneNumber = req.body.phone_number;
                        let firstName = req.body.first_name;
                        let lastName = req.body.last_name;

                        let result = await platformObj.register(phoneNumber, firstName, lastName);
                        let status = result.status;

                        if (status == 200) {
                            const MD5_HASH = result.md5_hash;

                            req.platformRes = {
                                result: MD5_HASH
                            };

                            return next();
                        };
                    };

                    if (!req.params.user_id) {
                        logger.error("NO USERID");
                        throw new ERRORS.BadRequest();
                    }
                    if (!req.cookies.SWOB) {
                        logger.error("NO COOKIE");
                        throw new ERRORS.Forbidden();
                    };

                    // ==================== REQUEST BODY CHECKS ====================
                    if (!req.body.phone_number) {
                        throw new ERRORS.BadRequest();
                    };

                    if (!req.body.code) {
                        throw new ERRORS.BadRequest();
                    };
                    // =============================================================

                    const PHONE_NUMBER = req.body.phone_number;
                    const AUTH_CODE = req.body.code;

                    let result = await platformObj.validate(PHONE_NUMBER, AUTH_CODE);
                    let status = result.status;

                    if (status == 200) {
                        const MD5_HASH = result.md5_hash;

                        req.platformRes = {
                            result: MD5_HASH
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

                throw new ERRORS.BadRequest();
            };

            throw new ERRORS.NotFound();
        };

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

        if (err instanceof ERRORS.Conflict) {
            return res.status(409).send(err.message);
        } // 409

        logger.error(err);
        return res.status(500).send("internal server error");
    };
}