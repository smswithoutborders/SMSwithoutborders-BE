"use strict";

const express = require('express');
const router = express.Router();
const {
    validationResult
} = require('express-validator');

const config = require('config');
const SERVER_CFG = config.get("SERVER");
const KEY = SERVER_CFG.api.KEY;

let logger = require("../../logger");

const fs = require('fs')
const Security = require("../../models/security.models");
const ERRORS = require("../../error.js");
const FIND_USERS = require("../../models/find_users.models");
const FIND_PLATFORMS = require("../../models/find_platforms.models");
const STORE_GRANTS = require("../../models/store_grant.models");
const VERIFY_USERS = require("../../models/verify_user.models");
const STORE_SESSION = require("../../models/store_sessions.models");
const FIND_USERSINFO = require("../../models/find_usersinfo.models");
const STORE_USERS = require("../../models/store_users.models");
const INIT_2FA = require("../../models/init_2fa.models");
const VERIFY_2FA = require("../../models/verify_2fa.models");
const VERIFY_SV = require("../../models/verify_sv.models");
const FIND_SESSION = require("../../models/find_sessions.models");
const UPDATE_SESSION = require("../../models/update_sessions.models");
const FIND_USERS_PLATFORMS = require("../../models/find_users_platform.models");
const DELETE_GRANTS = require("../../models/delete_grant.models");
const VERIFY_PASSWORDS = require("../../models/verify_password.models");
const MODIFY_PASSWORDS = require("../../models/modify_password.models");
const VERIFY_PHONE_NUMBER = require("../../models/verify_phone_number.models");
const PURGE_GRANTS = require("../../models/purge_grants.models");
const VERIFY_PLATFORMS = require("../../models/verify_platforms.models");
const VERIFY_RECOVERY = require("../../models/verify_recovery.models");
const DELETE_ACCOUNTS = require("../../models/delete_account.models");
const RECAPTCHA = require("../../models/recaptcha.models");

const VALIDATOR = require("../../models/validator.models");

var rootCas = require('ssl-root-cas').create()

require('https').globalAgent.options.ca = rootCas

// ==================== PRODUCTION ====================
let PLATFORMS = require("../../libs/platforms");

if ((SERVER_CFG.hasOwnProperty("ssl_api") && SERVER_CFG.hasOwnProperty("PEM")) && fs.existsSync(SERVER_CFG.ssl_api.PEM)) {
    rootCas.addFile('/var/www/ssl/server.pem')
}

router.post("/signup",
    VALIDATOR.phoneNumber,
    VALIDATOR.countryCode,
    VALIDATOR.password,
    VALIDATOR.captchaToken,
    // VALIDATOR.name,
    async (req, res) => {
        try {
            // Finds the validation errors in this request and wraps them in an object with handy functions
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errors.array().map(err => {
                    logger.error(`${err.param}: ${err.msg}`);
                });
                throw new ERRORS.BadRequest();
            }
            // =============================================================

            const COUNTRY_CODE = req.body.country_code;
            const NAME = req.body.name ? req.body.name : "";
            const PHONE_NUMBER = req.body.phone_number;
            const FULL_PHONE_NUMBER = req.body.country_code + req.body.phone_number;
            const PASSWORD = req.body.password;
            const CAPTCHATOKEN = req.body.captcha_token;
            const remoteIp = req.ip;

            let authRecaptcha = await RECAPTCHA(CAPTCHATOKEN, remoteIp);

            if (authRecaptcha) {
                let userInfo = await FIND_USERSINFO(COUNTRY_CODE, PHONE_NUMBER);

                if (!userInfo) {
                    let userId = await STORE_USERS(COUNTRY_CODE, PHONE_NUMBER, PASSWORD, NAME);
                    let init_2fa = await INIT_2FA(userId, FULL_PHONE_NUMBER);

                    return res.status(200).json({
                        session_id: init_2fa.session_id,
                        svid: init_2fa.svid
                    })
                } else {
                    logger.error("USER ALREADY HAS A RECORD IN USERINFO TABLE");
                    throw new ERRORS.Conflict();
                };
            } else {
                logger.error("INVALID CAPTCHATOKEN");
                throw new ERRORS.BadRequest();
            };
        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

router.put("/signup",
    VALIDATOR.code,
    VALIDATOR.sessionId,
    VALIDATOR.svid,
    async (req, res) => {
        try {
            // Finds the validation errors in this request and wraps them in an object with handy functions
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errors.array().map(err => {
                    logger.error(`${err.param}: ${err.msg}`);
                });
                throw new ERRORS.BadRequest();
            }
            // =============================================================

            const CODE = req.body.code;
            const SESSION_ID = req.body.session_id;
            const SVID = req.body.svid;

            let {
                usersInfo,
                user
            } = await VERIFY_SV(SESSION_ID, SVID);
            let verify_2fa = await VERIFY_2FA(usersInfo.full_phone_number, CODE, SESSION_ID);

            if (verify_2fa) {
                let security = new Security(KEY);

                await usersInfo.update({
                    phone_number: security.encrypt(usersInfo.phone_number).e_info,
                    name: security.encrypt(usersInfo.name).e_info,
                    country_code: security.encrypt(usersInfo.country_code).e_info,
                    full_phone_number: security.hash(usersInfo.full_phone_number),
                    status: "verified",
                    iv: security.iv
                }).catch(error => {
                    logger.error("ERROR UPDATING USER'S INFO AFTER SMS VERIFICATION");
                    throw new ERRORS.InternalServerError(error);
                });

                return res.status(200).json();
            };
        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

router.post("/login",
    VALIDATOR.phoneNumber,
    VALIDATOR.password,
    VALIDATOR.userAgent,
    VALIDATOR.captchaToken,
    async (req, res) => {
        try {
            // Finds the validation errors in this request and wraps them in an object with handy functions
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errors.array().map(err => {
                    logger.error(`${err.param}: ${err.msg}`);
                });
                throw new ERRORS.BadRequest();
            }
            // =============================================================

            const PHONE_NUMBER = req.body.phone_number;
            const PASSWORD = req.body.password;
            const USER_AGENT = req.get("user-agent");
            const CAPTCHATOKEN = req.body.captcha_token;
            const remoteIp = req.ip;

            let authRecaptcha = await RECAPTCHA(CAPTCHATOKEN, remoteIp);

            if (authRecaptcha) {
                let userId = await VERIFY_USERS(PHONE_NUMBER, PASSWORD);
                let session = await STORE_SESSION(userId, USER_AGENT, null, null, null);

                res.cookie("SWOB", {
                    sid: session.sid,
                    cookie: session.data
                }, session.data)

                return res.status(200).json({
                    uid: session.uid
                });
            } else {
                logger.error("INVALID CAPTCHATOKEN");
                throw new ERRORS.BadRequest();
            };
        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404
            if (err instanceof ERRORS.TooManyRequests) {
                return res.status(429).send(err.message);
            } // 429

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

router.get("/users/:user_id/platforms",
    VALIDATOR.cookies,
    VALIDATOR.userAgent,
    VALIDATOR.userId,
    async (req, res) => {
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

            const SID = req.cookies.SWOB.sid;
            const UID = req.params.user_id;
            const COOKIE = req.cookies.SWOB.cookie;
            const USER_AGENT = req.get("user-agent");

            const ID = await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);
            let user = await FIND_USERS(ID);
            const usersPlatforms = await FIND_USERS_PLATFORMS(user);

            let session = await UPDATE_SESSION(SID, ID, null);

            res.cookie("SWOB", {
                sid: session.sid,
                cookie: session.data
            }, session.data)

            return res.status(200).json(usersPlatforms);

        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

router.post("/users/:user_id/platforms/:platform/protocols/:protocol",
    VALIDATOR.userId,
    VALIDATOR.cookies,
    VALIDATOR.userAgent,
    async (req, res, next) => PLATFORMS(req, res, next), async (req, res) => {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
        try {
            const SID = req.cookies.SWOB.sid;
            const UID = req.params.user_id;
            const PLATFORM = req.params.platform;

            const URL = req.platformRes.url ? req.platformRes.url : "";
            const BODY = req.platformRes.body ? req.platformRes.body : "";

            let platform = await FIND_PLATFORMS(PLATFORM);

            let session = await UPDATE_SESSION(SID, UID, null);

            res.cookie("SWOB", {
                sid: session.sid,
                cookie: session.data
            }, session.data)

            return res.status(200).json({
                url: URL,
                body: BODY,
                platform: platform.name.toLowerCase()
            });

        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

router.put("/users/:user_id/platforms/:platform/protocols/:protocol/:action?",
    VALIDATOR.userId,
    VALIDATOR.cookies,
    VALIDATOR.userAgent,
    async (req, res, next) => PLATFORMS(req, res, next), async (req, res) => {
        try {
            const SID = req.cookies.SWOB.sid;
            const UID = req.params.user_id;
            const PLATFORM = req.params.platform;

            const RESULT = req.platformRes.result ? req.platformRes.result : "";
            const BODY = req.platformRes.body ? req.platformRes.body : "";
            const INIT_URL = req.platformRes.initialization_url ? req.platformRes.initialization_url : "";

            let user = await FIND_USERS(UID);
            let platform = await FIND_PLATFORMS(PLATFORM);

            if (RESULT) {
                await STORE_GRANTS(user, platform, RESULT);
            }

            let session = await UPDATE_SESSION(SID, UID, null);

            res.cookie("SWOB", {
                sid: session.sid,
                cookie: session.data
            }, session.data)

            return res.status(200).json({
                body: BODY,
                initialization_url: INIT_URL
            });

        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

router.delete("/users/:user_id/platforms/:platform/protocols/:protocol",
    VALIDATOR.userId,
    VALIDATOR.cookies,
    VALIDATOR.userAgent,
    async (req, res, next) => PLATFORMS(req, res, next), async (req, res) => {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
        try {
            const SID = req.cookies.SWOB.sid;
            const UID = req.params.user_id;

            const GRANT = req.platformRes.grant;

            await DELETE_GRANTS(GRANT);

            let session = await UPDATE_SESSION(SID, UID, null);

            res.cookie("SWOB", {
                sid: session.sid,
                cookie: session.data
            }, session.data)

            return res.status(200).json();

        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

router.post("/users/:user_id/password",
    VALIDATOR.userAgent,
    VALIDATOR.userId,
    VALIDATOR.cookies,
    VALIDATOR.password,
    VALIDATOR.newPassword,
    async (req, res) => {
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

            const SID = req.cookies.SWOB.sid;
            const UID = req.params.user_id;
            const COOKIE = req.cookies.SWOB.cookie;
            const USER_AGENT = req.get("user-agent");
            const PASSWORD = req.body.password;
            const NEW_PASSWORD = req.body.new_password;

            const ID = await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);
            const USER = await VERIFY_PASSWORDS(ID, PASSWORD);
            let GRANTS = await USER.getWallets();
            const originalURL = req.header("Origin");

            for (let i = 0; i < GRANTS.length; i++) {
                let PLATFORM = await VERIFY_PLATFORMS(GRANTS[i].platformId)
                let GRANT = await PURGE_GRANTS(originalURL, PLATFORM.name, GRANTS[i], USER);
                await DELETE_GRANTS(GRANT);
            };

            await MODIFY_PASSWORDS(USER, NEW_PASSWORD);

            let session = await UPDATE_SESSION(SID, ID, null);

            res.cookie("SWOB", {
                sid: session.sid,
                cookie: session.data
            }, session.data)

            return res.status(200).json();

        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

router.post("/recovery",
    VALIDATOR.phoneNumber,
    VALIDATOR.userAgent,
    async (req, res) => {
        try {
            // Finds the validation errors in this request and wraps them in an object with handy functions
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errors.array().map(err => {
                    logger.error(`${err.param}: ${err.msg}`);
                });
                throw new ERRORS.BadRequest();
            }
            // =============================================================

            const PHONE_NUMBER = req.body.phone_number;
            const USER_AGENT = req.get("user-agent");
            const USERID = await VERIFY_PHONE_NUMBER(PHONE_NUMBER);
            let init_2fa = await INIT_2FA(USERID, PHONE_NUMBER);
            const SVID = init_2fa.svid
            let session = await STORE_SESSION(PHONE_NUMBER, USER_AGENT, SVID, null, "recovery");

            res.cookie("SWOB", {
                sid: session.sid,
                svid: SVID,
                cookie: session.data
            }, session.data)

            return res.status(200).json();

        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

router.put("/recovery",
    VALIDATOR.userAgent,
    VALIDATOR.cookies,
    VALIDATOR.code,
    async (req, res) => {
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

            const SVID = req.cookies.SWOB.svid;
            const SID = req.cookies.SWOB.sid;
            const CODE = req.body.code;
            const COOKIE = req.cookies.SWOB.cookie;
            const USER_AGENT = req.get("user-agent");

            const {
                unique_identifier,
                session_id
            } = await VERIFY_RECOVERY(SID, SVID, USER_AGENT, null, COOKIE);

            const SESSION_ID = session_id;
            const PHONE_NUMBER = unique_identifier;

            let verify_2fa = await VERIFY_2FA(PHONE_NUMBER, CODE, SESSION_ID);

            if (verify_2fa) {
                const USERID = await VERIFY_PHONE_NUMBER(PHONE_NUMBER);
                let session = await UPDATE_SESSION(SID, PHONE_NUMBER, "success");

                res.cookie("SWOB", {
                    sid: session.sid,
                    svid: SVID,
                    cookie: session.data
                }, session.data)

                return res.status(200).json({
                    uid: USERID
                });
            }
        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

router.post("/users/:user_id/recovery",
    VALIDATOR.userId,
    VALIDATOR.userAgent,
    VALIDATOR.cookies,
    VALIDATOR.newPassword,
    async (req, res) => {
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

            const SID = req.cookies.SWOB.sid;
            const SVID = req.cookies.SWOB.svid;
            const UID = req.params.user_id;
            const COOKIE = req.cookies.SWOB.cookie;
            const USER_AGENT = req.get("user-agent");
            const NEW_PASSWORD = req.body.new_password;

            const {
                unique_identifier,
            } = await VERIFY_RECOVERY(SID, SVID, USER_AGENT, "success", COOKIE);

            const PHONE_NUMBER = unique_identifier;

            let USER = await FIND_USERS(UID);
            let GRANTS = await USER.getWallets();
            const originalURL = req.header("Origin");

            for (let i = 0; i < GRANTS.length; i++) {
                let PLATFORM = await VERIFY_PLATFORMS(GRANTS[i].platformId)
                let GRANT = await PURGE_GRANTS(originalURL, PLATFORM.name, GRANTS[i], USER);
                await DELETE_GRANTS(GRANT);
            };

            await MODIFY_PASSWORDS(USER, NEW_PASSWORD);

            await UPDATE_SESSION(SID, PHONE_NUMBER, "updated");

            return res.status(200).json();
        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

router.delete("/users/:user_id",
    VALIDATOR.userId,
    VALIDATOR.cookies,
    VALIDATOR.password,
    VALIDATOR.userAgent,
    async (req, res) => {
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

            const SID = req.cookies.SWOB.sid;
            const UID = req.params.user_id;
            const COOKIE = req.cookies.SWOB.cookie;
            const USER_AGENT = req.get("user-agent");
            const PASSWORD = req.body.password;

            const ID = await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);
            const USER = await VERIFY_PASSWORDS(ID, PASSWORD);
            let GRANTS = await USER.getWallets();
            const originalURL = req.header("Origin");

            for (let i = 0; i < GRANTS.length; i++) {
                let PLATFORM = await VERIFY_PLATFORMS(GRANTS[i].platformId)
                let GRANT = await PURGE_GRANTS(originalURL, PLATFORM.name, GRANTS[i], USER);
                await DELETE_GRANTS(GRANT);
            };

            await DELETE_ACCOUNTS(USER);

            return res.status(200).json();
        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

router.post("/users/:user_id/verify",
    VALIDATOR.userId,
    VALIDATOR.userAgent,
    VALIDATOR.cookies,
    VALIDATOR.password,
    async (req, res) => {
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

            const UID = req.params.user_id;
            const USER_AGENT = req.get("user-agent");
            const PASSWORD = req.body.password;
            const RETRY_COUNTER = require("../../models/retry_counter.models");

            let counter = await RETRY_COUNTER.check(UID);
            const USER = await VERIFY_PASSWORDS(UID, PASSWORD).catch(async (err) => {
                if (err instanceof ERRORS.Forbidden) {
                    let addCount = await RETRY_COUNTER.add(counter);
                    if (addCount.state == "success") {
                        throw new ERRORS.Unauthorized(); //401
                    };
                }
                if (err instanceof ERRORS.Conflict) {
                    throw new ERRORS.Conflict();
                } // 409

                throw new ERRORS.InternalServerError(err);
            });

            let session = await STORE_SESSION(USER.id, USER_AGENT, null, null, null);

            res.cookie("SWOB", {
                sid: session.sid,
                cookie: session.data
            }, session.data)

            let removeCount = await RETRY_COUNTER.remove(counter);
            if (removeCount.state == "success") {
                return res.status(200).json();
            };
        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404
            if (err instanceof ERRORS.TooManyRequests) {
                return res.status(429).send(err.message);
            } // 429

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

router.get("/users/:user_id/dashboard",
    VALIDATOR.cookies,
    VALIDATOR.userAgent,
    VALIDATOR.userId,
    async (req, res) => {
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

            const SID = req.cookies.SWOB.sid;
            const UID = req.params.user_id;
            const COOKIE = req.cookies.SWOB.cookie;
            const USER_AGENT = req.get("user-agent");

            const ID = await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);

            let USER = await FIND_USERS(ID);
            let createdAt = USER.createdAt;
            let updatedAt = USER.updatedAt;

            let session = await UPDATE_SESSION(SID, ID, null);

            res.cookie("SWOB", {
                sid: session.sid,
                cookie: session.data
            }, session.data)

            return res.status(200).json({
                createdAt: createdAt,
                updatedAt: updatedAt
            });
        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

router.post("/users/:user_id/logout",
    VALIDATOR.userAgent,
    VALIDATOR.userId,
    VALIDATOR.cookies,
    async (req, res) => {
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

            const SID = req.cookies.SWOB.sid;
            const UID = req.params.user_id;
            const COOKIE = req.cookies.SWOB.cookie;
            const USER_AGENT = req.get("user-agent");

            await FIND_SESSION(SID, UID, USER_AGENT, null, null, null, COOKIE);

            logger.info("CLEARING BROWSER COOKIE ...");
            res.clearCookie("SWOB");

            return res.status(200).json();

        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

// =============================================================

module.exports = router;