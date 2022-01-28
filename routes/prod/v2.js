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
const FIND_SESSION = require("../../models/find_sessions.models");
const UPDATE_SESSION = require("../../models/update_sessions.models");
const FIND_USERS_PLATFORMS = require("../../models/find_users_platform.models");

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
                console.error("NO PHONE NUMBER");
                throw new ERRORS.BadRequest();
            };

            if (!req.body.name) {
                console.error("NO NAME");
                throw new ERRORS.BadRequest();
            };

            if (!req.body.country_code) {
                console.error("NO COUNTRY CODE");
                throw new ERRORS.BadRequest();
            };

            if (!req.body.password) {
                console.error("NO PASSWORD");
                throw new ERRORS.BadRequest();
            };

            // TODO ADD MIDDLEWARE CHECKS
            if (req.body.password.length < 8) {
                console.error("PASSWORD < 8 CHARS");
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
                console.error("USER ALREADY HAS A RECORD IN USERINFO TABLE");
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
                console.error("NO CODE");
                throw new ERRORS.BadRequest();
            };

            if (!req.body.session_id) {
                console.error("NO SESSION ID");
                throw new ERRORS.BadRequest();
            };

            if (!req.body.svid) {
                console.error("NO SVID");
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
                    console.error("ERROR UPDATING USER'S INFO AFTER SMS VERIFICATION");
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
                console.error("NO PHONE NUMBER");
                throw new ERRORS.BadRequest();
            };

            if (!req.body.password) {
                console.error("NO PASSWORD");
                throw new ERRORS.BadRequest();
            };

            // TODO ADD MIDDLEWARE CHECKS
            if (req.body.password.length < 8) {
                console.error("PASSWORD < 8 CHARS");
                throw new ERRORS.BadRequest();
            };
            // =============================================================
            const PHONE_NUMBER = req.body.phone_number;
            const PASSWORD = req.body.password;
            const USER_AGENT = req.get("user-agent");

            let userId = await VERIFY_USERS(PHONE_NUMBER, PASSWORD);
            let session = await STORE_SESSION(userId, USER_AGENT);

            res.cookie("SWOB", {
                sid: session.sid,
                cookie: session.data
            }, session.data)

            return res.status(200).json({
                uid: session.uid
            });

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

    app.get("/users/:user_id/platforms", async (req, res, next) => {
        try {
            if (!req.params.user_id) {
                console.error("NO USERID");
                throw new ERRORS.BadRequest();
            }
            if (!req.cookies.SWOB) {
                console.error("NO COOKIE");
                throw new ERRORS.BadRequest();
            };
            const SID = req.cookies.SWOB.sid;
            const UID = req.params.user_id;
            const COOKIE = req.cookies.SWOB.cookie;
            const USER_AGENT = req.get("user-agent");

            const ID = await FIND_SESSION(SID, UID, USER_AGENT, COOKIE);
            let user = await FIND_USERS(ID);
            const usersPlatforms = await FIND_USERS_PLATFORMS(user);

            let session = await UPDATE_SESSION(SID, ID);

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

    app.post("/users/:user_id/platforms/:platform/protocols/:protocol", async (req, res, next) => PLATFORMS(req, res, next), async (req, res, next) => {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
        try {
            if (!req.params.user_id) {
                console.error("NO USERID");
                throw new ERRORS.BadRequest();
            }
            if (!req.cookies.SWOB) {
                console.error("NO COOKIE");
                throw new ERRORS.BadRequest();
            };
            const SID = req.cookies.SWOB.sid;
            const UID = req.params.user_id;
            const COOKIE = req.cookies.SWOB.cookie;
            const USER_AGENT = req.get("user-agent");

            const ID = await FIND_SESSION(SID, UID, USER_AGENT, COOKIE);
            const PLATFORM = req.params.platform;
            const URL = req.platformRes.url ? req.platformRes.url : "";
            const CODE = req.platformRes.code ? req.platformRes.code : "";

            let platform = await FIND_PLATFORMS(PLATFORM);

            let session = await UPDATE_SESSION(SID, ID);

            res.cookie("SWOB", {
                sid: session.sid,
                cookie: session.data
            }, session.data)

            return res.status(200).json({
                url: URL,
                code: CODE,
                platform: platform.name.toLowerCase()
            });

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

    app.put("/users/:user_id/platforms/:platform/protocols/:protocol/:action?", async (req, res, next) => PLATFORMS(req, res, next), async (req, res, next) => {
        try {
            if (!req.params.user_id) {
                console.error("NO USERID");
                throw new ERRORS.BadRequest();
            }
            if (!req.cookies.SWOB) {
                console.error("NO COOKIE");
                throw new ERRORS.BadRequest();
            };
            const SID = req.cookies.SWOB.sid;
            const UID = req.params.user_id;
            const COOKIE = req.cookies.SWOB.cookie;
            const USER_AGENT = req.get("user-agent");

            const ID = await FIND_SESSION(SID, UID, USER_AGENT, COOKIE);
            const PLATFORM = req.params.platform;
            const RESULT = req.platformRes.result ? req.platformRes.result : "";
            const CODE = req.platformRes.code ? req.platformRes.code : "";
            const INIT_URL = req.platformRes.initialization_url ? req.platformRes.initialization_url : "";

            let user = await FIND_USERS(ID);
            let platform = await FIND_PLATFORMS(PLATFORM);

            if (RESULT) {
                await STORE_TOKENS(user, platform, RESULT);
            }

            let session = await UPDATE_SESSION(SID, ID);

            res.cookie("SWOB", {
                sid: session.sid,
                cookie: session.data
            }, session.data)

            return res.status(200).json({
                code: CODE,
                initialization_url: INIT_URL
            });

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

    app.post("/users/:user_id/logout", async (req, res, next) => {
        try {
            if (!req.params.user_id) {
                console.error("NO USERID");
                throw new ERRORS.BadRequest();
            }
            if (!req.cookies.SWOB) {
                throw new ERRORS.BadRequest();
            };
            const SID = req.cookies.SWOB.sid;
            const UID = req.params.user_id;
            const COOKIE = req.cookies.SWOB.cookie;
            const USER_AGENT = req.get("user-agent");

            await FIND_SESSION(SID, UID, USER_AGENT, COOKIE);

            console.log("CLEARING BROWSER COOKIE");
            res.clearCookie("SWOB");

            return res.status(200).json();

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

}
// =============================================================