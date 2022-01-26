const fs = require('fs')
const Security = require("../../models/security.models");
const ERRORS = require("../../error.js");
const FIND_USERS = require("../../models/find_users.models");
const FIND_PLATFORMS = require("../../models/find_platforms.models");
const STORE_TOKENS = require("../../models/store_tokens.models");
const VERIFY_USERS = require("../../models/verify_user.models");
const STORE_SESSION = require("../../models/store_sessions.models");
const FIND_USERSINFO = require("../../models/find_usersinfo.models");
const STORE_USERS = require("../../models/store_users.models");
const INIT_2FA = require("../../models/init_2fa.models");
const VERIFY_2FA = require("../../models/verify_2fa.models");
const VERIFY_SV = require("../../models/verify_sv.models");

var rootCas = require('ssl-root-cas').create()

require('https').globalAgent.options.ca = rootCas

// ==================== PRODUCTION ====================
module.exports = (app, configs) => {
    let PLATFORMS = require("../../libs/platforms");

    if ((configs.hasOwnProperty("ssl_api") && configs.hasOwnProperty("PEM")) && fs.existsSync(configs.ssl_api.PEM)) {
        rootCas.addFile('/var/www/ssl/server.pem')
    }

    app.post("/signup", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.phone_number) {
                throw new ERRORS.BadRequest();
            };

            if (!req.body.name) {
                throw new ERRORS.BadRequest();
            };

            if (!req.body.country_code) {
                throw new ERRORS.BadRequest();
            };

            if (!req.body.password) {
                throw new ERRORS.BadRequest();
            };

            // TODO ADD MIDDLEWARE CHECKS
            if (req.body.password.length < 8) {
                throw new ERRORS.BadRequest();
            };
            // =============================================================
            const COUNTRY_CODE = req.body.country_code;
            const NAME = req.body.name;
            const PHONE_NUMBER = req.body.phone_number;
            const FULL_PHONE_NUMBER = req.body.country_code + req.body.phone_number;
            const PASSWORD = req.body.password;

            let userInfo = await FIND_USERSINFO(COUNTRY_CODE, PHONE_NUMBER);

            if (!userInfo) {
                let userId = await STORE_USERS(COUNTRY_CODE, PHONE_NUMBER, PASSWORD, NAME);
                let init_2fa = await INIT_2FA(userId, FULL_PHONE_NUMBER);

                return res.status(200).json({
                    session_id: init_2fa.session_id,
                    svid: init_2fa.svid
                })
            } else {
                throw new ERRORS.Conflict();
            };
        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            console.error(err);
            return res.status(500).send("internal server error");
        }
    });

    app.put("/signup", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.code) {
                throw new ERRORS.BadRequest();
            };

            if (!req.body.session_id) {
                throw new ERRORS.BadRequest();
            };

            if (!req.body.svid) {
                throw new ERRORS.BadRequest();
            };
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
                var security = new Security(user.password);

                await usersInfo.update({
                    phone_number: security.encrypt(usersInfo.phone_number).e_info,
                    name: security.encrypt(usersInfo.name).e_info,
                    country_code: security.encrypt(usersInfo.country_code).e_info,
                    full_phone_number: security.hash(usersInfo.full_phone_number),
                    status: "verified",
                    iv: security.iv
                }).catch(error => {
                    throw new ERRORS.InternalServerError(error);
                });

                return res.status(200).json();
            };
        } catch (err) {
            if (err instanceof ERRORS.BadRequest) {
                return res.status(400).send(err.message);
            } // 400
            if (err instanceof ERRORS.Forbidden) {
                return res.status(401).send(err.message);
            } // 401
            if (err instanceof ERRORS.Unauthorized) {
                return res.status(403).send(err.message);
            } // 403
            if (err instanceof ERRORS.Conflict) {
                return res.status(409).send(err.message);
            } // 409
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            console.error(err);
            return res.status(500).send("internal server error");
        }
    });

    app.post("/login", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.phone_number) {
                throw new ERRORS.BadRequest();
            };

            if (!req.body.password) {
                throw new ERRORS.BadRequest();
            };

            // TODO ADD MIDDLEWARE CHECKS
            if (req.body.password.length < 8) {
                throw new ERRORS.BadRequest();
            };
            // =============================================================
            const PHONE_NUMBER = req.body.phone_number;
            const PASSWORD = req.body.password;
            const USER_AGENT = req.get("user-agent");

            let userId = await VERIFY_USERS(PHONE_NUMBER, PASSWORD);
            let session = await STORE_SESSION(userId, USER_AGENT);

            res.cookie("SWOB", {
                sid: session.sid
            }, session.data)

            return res.status(200).json();

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
            if (err instanceof ERRORS.NotFound) {
                return res.status(404).send(err.message);
            } // 404

            console.error(err);
            return res.status(500).send("internal server error");
        }
    });

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
            const URL = req.platformRes.url ? req.platformRes.url : "";
            const CODE = req.platformRes.code ? req.platformRes.code : "";

            let user = await FIND_USERS(ID, AUTH_KEY);
            let platform = await FIND_PLATFORMS(PLATFORM);

            return res.status(200).json({
                url: URL,
                code: CODE,
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

    app.put("/platforms/:platform/protocols/:protocol/:action?", async (req, res, next) => PLATFORMS(req, res, next), async (req, res, next) => {
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
            const RESULT = req.platformRes.result ? req.platformRes.result : "";
            const CODE = req.platformRes.code ? req.platformRes.code : "";

            let user = await FIND_USERS(ID, AUTH_KEY);
            let platform = await FIND_PLATFORMS(PLATFORM);
            let auth_key = ""

            if (RESULT) {
                auth_key = await STORE_TOKENS(user, platform, RESULT);
            }

            return res.status(200).json({
                code: CODE,
                auth_key: auth_key ? auth_key : AUTH_KEY
            });

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