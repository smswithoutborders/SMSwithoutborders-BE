"use strict";

const express = require('express');
const router = express.Router();
const {
    validationResult
} = require('express-validator');

let logger = require("../../logger");

const ERRORS = require("../../error.js");

const STORE_SESSION = require("../../models/store_sessions.models");
const FIND_USERS = require("../../models/find_users.models");
const VERIFY_PHONE_NUMBER = require("../../models/verify_phone_number.models");
const FIND_DEV_SESSION = require("../../models/find_developers_sessions.models");
const FIND_GRANTS = require("../../models/find_grant.models");
const DECRYPT_GRANTS = require("../../models/decrypt_grant.models");
const FIND_PLATFORMS = require("../../models/find_platforms.models");

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
            let DEV_SID = "";
            let DEV_COOKIE = "";
            let DEV_USER_AGENT = "";
            let DEV_UID = "";
            let EXT = "";

            if (typeof (DEV_COOKIE_CHECK) == "string") {
                let string_cookie = DEV_COOKIE_CHECK
                string_cookie = string_cookie.replaceAll("\\054", ",");
                string_cookie = string_cookie.replaceAll("\\", "");
                let json_cookie = JSON.parse(string_cookie)
                DEV_SID = json_cookie.sid;
                DEV_COOKIE = json_cookie.cookie;
                DEV_USER_AGENT = json_cookie.userAgent;
                DEV_UID = json_cookie.uid;
                EXT = "py"
            } else {
                DEV_SID = req.cookies.SWOBDev.sid;
                DEV_COOKIE = req.cookies.SWOBDev.cookie;
                DEV_USER_AGENT = req.cookies.SWOBDev.userAgent;
                DEV_UID = req.cookies.SWOBDev.uid;
                EXT = "js"
            }

            await FIND_DEV_SESSION(DEV_SID, DEV_UID, DEV_USER_AGENT, DEV_COOKIE, EXT);

            const USERID = await VERIFY_PHONE_NUMBER(PHONE_NUMBER);
            const USER = await FIND_USERS(USERID);
            let platform = await FIND_PLATFORMS(PLATFORM);
            const GRANT = await FIND_GRANTS(USER, platform);
            const DECRYPTED_GRANT = await DECRYPT_GRANTS(GRANT, USER);

            await STORE_SESSION(USERID, USER_AGENT, null, null, "publisher");

            res.status(200).json({
                username: DECRYPTED_GRANT.username,
                token: DECRYPTED_GRANT.token,
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
                return res.status(404).send(err.message);
            } // 404

            logger.error(err);
            return res.status(500).send("internal server error");
        }
    });

// =============================================================

module.exports = router;