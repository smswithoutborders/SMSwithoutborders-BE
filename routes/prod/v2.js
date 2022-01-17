const fs = require('fs')
const ERRORS = require("../../error.js");
const FIND_USERS = require("../../models/find_users.models");
const FIND_PLATFORMS = require("../../models/find_platforms.models");
const STORE_TOKENS = require("../../models/store_tokens.models");

var rootCas = require('ssl-root-cas').create()

require('https').globalAgent.options.ca = rootCas

// ==================== PRODUCTION ====================
module.exports = (app, configs) => {
    let PLATFORMS = require("../../libs/platforms/PLATFORMS");

    if ((configs.hasOwnProperty("ssl_api") && configs.hasOwnProperty("PEM")) && fs.existsSync(configs.ssl_api.PEM)) {
        rootCas.addFile('/var/www/ssl/server.pem')
    }

    app.post("/:platform/:protocol", async (req, res, next) => PLATFORMS(req, res, next), async (req, res, next) => {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.id) {
                throw new ERRORS.BadRequest();
            };

            if (!req.body.auth_key) {
                throw new ERRORS.BadRequest();
            };
            // =============================================================

            const ID = req.body.id;
            const AUTH_KEY = req.body.auth_key;
            const PLATFORM = req.params.platform;

            let user = await FIND_USERS(ID, AUTH_KEY);

            let originalURL = req.header("Origin");
            const platformObj = req.platform;
            let URL = await platformObj.init(originalURL);

            return res.status(200).json({
                url: URL,
                auth_key: user.auth_key,
                platform: PLATFORM
            })

        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409

            console.error(err);
            return res.status(500).send("internal server error");
        }
    });

    app.put("/:platform/:protocol", async (req, res, next) => PLATFORMS(req, res, next), async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.id) {
                throw new ERRORS.BadRequest();
            };

            if (!req.body.auth_key) {
                throw new ERRORS.BadRequest();
            };

            if (!req.body.auth_code) {
                throw new ERRORS.BadRequest();
            };
            // =============================================================

            const ID = req.body.id;
            const AUTH_KEY = req.body.auth_key;
            // INFO - Google API returns a UTF-8 encoded verification code on second request of OAuth2 token
            // INFO - Google API Client requires a non UTF-8 verification code, so we decode every verification code entry at API level  
            const AUTH_CODE = decodeURIComponent(req.body.auth_code);
            const PLATFORM = req.params.platform;

            let user = await FIND_USERS(ID, AUTH_KEY);
            let platform = await FIND_PLATFORMS(PLATFORM);

            let originalURL = req.header("Origin");
            const platformObj = req.platform;
            let RESULT = await platformObj.validate(originalURL, AUTH_CODE);

            let auth_key = await STORE_TOKENS(user, platform, RESULT);

            return res.status(200).json({
                auth_key: auth_key
            })

        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409

            console.error(err);
            return res.status(500).send("internal server error");
        }
    })

}
// =============================================================