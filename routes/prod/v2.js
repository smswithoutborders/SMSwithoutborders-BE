const fs = require('fs')
const Axios = require('axios');
var rootCas = require('ssl-root-cas').create()

require('https').globalAgent.options.ca = rootCas
axios = Axios;

// ==================== PRODUCTION ====================
module.exports = (app, configs, db) => {
    var User = db.users;
    var Token = db.tokens;
    var UsersInfo = db.usersInfo;
    var Provider = db.providers;
    var Platform = db.platforms;
    var SmsVerification = db.smsVerification;
    let PLATFORMS = require("../../libs/platforms/PLATFORMS");

    if ((configs.hasOwnProperty("ssl_api") && configs.hasOwnProperty("PEM")) && fs.existsSync(configs.ssl_api.PEM)) {
        rootCas.addFile('/var/www/ssl/server.pem')
    }

    app.post("/:platform/:protocol", async (req, res, next) => PLATFORMS(req, res, next), async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================

            // =============================================================
            let originalURL = req.header("Origin");
            const platform = req.platform;
            let URL = await platform.init(originalURL)

            return res.status(200).json(
                URL
            )

        } catch (error) {
            next(error)
        }
    });

    app.post("/:platform/:protocol:auth_code", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================

            // =============================================================

            return res.status(200).json({
                platform: req.params.platform,
                protocol: req.params.protocol
            })

        } catch (error) {
            next(error)
        }
    })

}
// =============================================================