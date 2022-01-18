const fs = require('fs')
const ERRORS = require("../../error.js");
const FIND_USERS = require("../../models/find_users.models");
const FIND_PLATFORMS = require("../../models/find_platforms.models");
const STORE_TOKENS = require("../../models/store_tokens.models");

var rootCas = require('ssl-root-cas').create()

require('https').globalAgent.options.ca = rootCas

// ==================== PRODUCTION ====================
module.exports = (app, configs) => {
    let PLATFORMS = require("../../libs/platforms");

    if ((configs.hasOwnProperty("ssl_api") && configs.hasOwnProperty("PEM")) && fs.existsSync(configs.ssl_api.PEM)) {
        rootCas.addFile('/var/www/ssl/server.pem')
    }

    app.post("/platforms/:platform/protocols/:protocol", async (req, res, next) => PLATFORMS(req, res, next), async (req, res, next) => {
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
            const URL = req.platformRes.url;

            let user = await FIND_USERS(ID, AUTH_KEY);
            let platform = await FIND_PLATFORMS(PLATFORM);

            return res.status(200).json({
                url: URL,
                auth_key: user.auth_key,
                platform: platform.name.toLowerCase()
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

    app.put("/platforms/:platform/protocols/:protocol", async (req, res, next) => PLATFORMS(req, res, next), async (req, res, next) => {
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
            const PLATFORM = req.params.platform;
            const RESULT = req.platformRes.result;

            let user = await FIND_USERS(ID, AUTH_KEY);
            let platform = await FIND_PLATFORMS(PLATFORM);

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