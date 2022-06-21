"use strict";

const config = require('config');
const SERVER_CFG = config.get("SERVER");
const KEY = SERVER_CFG.api.KEY;

const express = require('express');
const router = express.Router();
const {
    validationResult
} = require('express-validator');

let logger = require("../../logger");

const ERRORS = require("../../error.js");
const Security = require("../../models/security.models.js");

const STORE_SESSION = require("../../models/store_sessions.models");
const FIND_USERS = require("../../models/find_users.models");
const VERIFY_PHONE_NUMBER = require("../../models/verify_phone_number.models");
const FIND_DEV_SESSION = require("../../models/find_developers_sessions.models");
const FIND_GRANTS = require("../../models/find_grant.models");
const DECRYPT_GRANTS = require("../../models/decrypt_grant.models");
const FIND_PLATFORMS = require("../../models/find_platforms.models");
const REFRESH_TOKENS = require("../../models/refresh_token.models");
const DELETE_GRANTS = require("../../models/delete_grant.models");
const PURGE_GRANTS = require("../../models/purge_grants.models");
const VERIFY_PLATFORMS = require("../../models/verify_platforms.models");

const VALIDATOR = require("../../models/validator.models");

// ==================== PUBLISHER ====================
router.post("/decrypt",
    VALIDATOR.phoneNumber,
    VALIDATOR.platform,
    VALIDATOR.developerCookies,
    VALIDATOR.userAgent,
    async (req, res) => {
        try {
            // Finds the validation errors in this request and wraps them in an object with handy functions
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errors.array().map(err => {
                    if (err.param == "SWOBDev") {
                        logger.error(`${err.param}: ${err.msg}`);
                        throw new ERRORS.Unauthorized();
                    }
                    logger.error(`${err.param}: ${err.msg}`);
                });
                throw new ERRORS.BadRequest();
            }
            // =============================================================

            const PHONE_NUMBER = req.body.phone_number;
            const PLATFORM = req.body.platform;
            const USER_AGENT = req.get("user-agent");
            let DEV_COOKIE_CHECK = req.cookies.SWOBDev;
            let dev_cookie_buff = Buffer.from(DEV_COOKIE_CHECK, "base64")
            let dev_cookie_str = dev_cookie_buff.toString('utf-8');
            let dev_cookie = JSON.parse(dev_cookie_str)
            let DEV_COOKIE = dev_cookie.cookie;
            let DEV_USER_AGENT = dev_cookie.userAgent;
            let DEV_UID = dev_cookie.uid;
            let veri_path = dev_cookie.verification_path

            await FIND_DEV_SESSION(DEV_UID, DEV_USER_AGENT, DEV_COOKIE, veri_path);

            const USERID = await VERIFY_PHONE_NUMBER(PHONE_NUMBER);
            const USER = await FIND_USERS(USERID);
            let platform = await FIND_PLATFORMS(PLATFORM);
            const GRANT = await FIND_GRANTS(USER, platform);
            const DECRYPTED_GRANT = await DECRYPT_GRANTS(GRANT, USER);
            const refreshed_token = await REFRESH_TOKENS(DECRYPTED_GRANT.token, platform)

            if (refreshed_token) {
                let security = new Security(KEY);

                await GRANT.update({
                    username: security.encrypt(JSON.stringify(DECRYPTED_GRANT.username)).e_info,
                    uniqueId: security.encrypt(JSON.stringify(DECRYPTED_GRANT.uniqueId)).e_info,
                    token: security.encrypt(JSON.stringify(refreshed_token)).e_info,
                    iv: security.iv
                })
            }

            await STORE_SESSION(USERID, USER_AGENT, null, null, "publisher");

            res.status(200).json({
                username: DECRYPTED_GRANT.username,
                token: refreshed_token ? refreshed_token : DECRYPTED_GRANT.token,
                uniqueId: DECRYPTED_GRANT.uniqueId
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
                return res.status(200).send([]);
            } // 404

            logger.error(err.stack || err);
            return res.status(500).send("internal server error");
        }
    });

router.post("/whoami",
    VALIDATOR.phoneNumber,
    VALIDATOR.developerCookies,
    VALIDATOR.userAgent,
    async (req, res) => {
        try {
            // Finds the validation errors in this request and wraps them in an object with handy functions
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errors.array().map(err => {
                    if (err.param == "SWOBDev") {
                        logger.error(`${err.param}: ${err.msg}`);
                        throw new ERRORS.Unauthorized();
                    }
                    logger.error(`${err.param}: ${err.msg}`);
                });
                throw new ERRORS.BadRequest();
            }
            // =============================================================

            const PHONE_NUMBER = req.body.phone_number;
            const USER_AGENT = req.get("user-agent");
            let DEV_COOKIE_CHECK = req.cookies.SWOBDev;
            let dev_cookie_buff = Buffer.from(DEV_COOKIE_CHECK, "base64")
            let dev_cookie_str = dev_cookie_buff.toString('utf-8');
            let dev_cookie = JSON.parse(dev_cookie_str)
            let DEV_COOKIE = dev_cookie.cookie;
            let DEV_USER_AGENT = dev_cookie.userAgent;
            let DEV_UID = dev_cookie.uid;
            let veri_path = dev_cookie.verification_path

            await FIND_DEV_SESSION(DEV_UID, DEV_USER_AGENT, DEV_COOKIE, veri_path);

            const USERID = await VERIFY_PHONE_NUMBER(PHONE_NUMBER);

            let session = await STORE_SESSION(USERID, USER_AGENT, null, null, "publisher");

            res.status(200).json({
                user_id: session.uid
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
                return res.status(200).send([]);
            } // 404

            logger.error(err.stack || err);
            return res.status(500).send("internal server error");
        }
    });

router.delete("/revoke_all",
    async (req, res) => {
        try {
            const originalURL = req.header("Origin");

            var User = db.users;

            let user = await User.findAll().catch(error => {
                logger.error("ERROR FINDING USER");
                throw new ERRORS.InternalServerError(error);
            })

            for (let i = 0; i < user.length; i++) {
                logger.info(`Revoking ${i+1} of ${user.length} accounts ...`)
                let GRANTS = await user[i].getWallets();

                for (let j = 0; j < GRANTS.length; j++) {
                    let PLATFORM = await VERIFY_PLATFORMS(GRANTS[j].platformId)
                    let GRANT = await PURGE_GRANTS(originalURL, PLATFORM.name, GRANTS[j], user[i]);
                    await DELETE_GRANTS(GRANT);
                };
            }

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

            logger.error(err.stack || err);
            return res.status(500).send("internal server error");
        }
    });

// =============================================================

module.exports = router;