const fs = require('fs')
const {
    v4: uuidv4
} = require('uuid');
const {
    Op,
    QueryTypes
} = require("sequelize");
const Axios = require('axios');
const Security = require("../../models/security.models.js");
const credentials = require("../../credentials.json");
const GlobalSecurity = new Security()
const {
    ErrorHandler
} = require('../../controllers/error.js')
const _2FA = require("../../models/2fa.models.js");

var rootCas = require('ssl-root-cas').create()

require('https').globalAgent.options.ca = rootCas

axios = Axios

// =========================================================================================================================

// ==================== GMAIL ====================
const GMAIL = fs.existsSync(__dirname + "/../../Providers/Google/Gmail.js") ? require("../../Providers/Google/Gmail.js") : false;
const gmail_token_scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

let gmail = !GMAIL ? false : new GMAIL(credentials, gmail_token_scopes);

// ==================== TWITTER ====================
const TWITTER = fs.existsSync(__dirname + "/../../Providers/Twitter/Twitter.js") ? require("../../Providers/Twitter/Twitter.js") : false;

let twitter = !TWITTER ? false : new TWITTER(credentials);
// =========================================================================================================================

// ==================== DEVELOPMENT ====================
module.exports = (app, configs, db) => {
    var User = db.users;
    var Token = db.tokens;

    if ((configs.hasOwnProperty("ssl_api") && configs.hasOwnProperty("PEM")) && fs.existsSync(configs.ssl_api.PEM)) {
        rootCas.addFile('/var/www/ssl/server.pem')
    }

    app.post("/locals/users/hash1", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.id) {
                throw new ErrorHandler(400, "Id cannot be empty");
            };
            // =============================================================

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    id: req.body.id
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN = [], IF NO USER FOUND
            if (user.length < 1) {
                throw new ErrorHandler(401, "User doesn't exist");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (user.length > 1) {
                throw new ErrorHandler(409, "Duplicate Users");
            }

            // RETURN PASSWORD HASH
            return res.status(200).json({
                password_hash: user[0].password
            });
        } catch (error) {
            next(error);
        }
    });

    app.post("/users/profiles", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.id) {
                throw new ErrorHandler(400, "ID cannot be empty");
            };
            // =============================================================

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    id: req.body.id
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN = [], IF NO USER FOUND
            if (user.length < 1) {
                throw new ErrorHandler(401, "User doesn't exist");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (user.length > 1) {
                throw new ErrorHandler(409, "Duplicate Users");
            };

            // // CREATE AUTH_KEY ON LOGIN
            // await user[0].update({
            //     auth_key: uuidv4()
            // }).catch(error => {
            //     throw new ErrorHandler(500, error);
            // });

            return res.status(200).json({
                id: user[0].id,
                auth_key: user[0].auth_key
            });
        } catch (error) {
            next(error);
        }
    });

    app.post("/users/providers", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.id) {
                throw new ErrorHandler(400, "ID cannot be empty");
            };
            // =============================================================

            // store tokens from db
            let userData = {
                user_provider: []
            }

            let user = await User.findAll({
                where: {
                    id: req.body.id
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RTURN = [], IF USER IS NOT FOUND
            if (user.length < 1) {
                throw new ErrorHandler(401, "User doesn't exist");
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (user.length > 1) {
                throw new ErrorHandler(409, "Duplicate Users");
            }

            var security = new Security(user[0].password);

            let token = await user[0].getTokens();

            if (token.length < 1) {
                return res.status(200).json(userData);
            }

            // get all tokens
            for (let i = 0; i < token.length; i++) {
                let provider = await token[i].getProvider();
                let platform = await token[i].getPlatform();
                let profile = JSON.parse(security.decrypt(token[i].profile, token[i].iv))

                if (provider) {
                    userData.user_provider.push({
                        provider: provider.name,
                        platform: platform.name,
                        email: profile.data.email
                    })
                }
            }

            return res.status(200).json(userData);
        } catch (error) {
            next(error)
        }
    });

    app.post("/hash", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.email) {
                throw new ErrorHandler(400, "Email cannot be empty");
            };
            // =============================================================
            let tokens = await Token.findAll({
                where: {
                    email: GlobalSecurity.hash(req.body.email)
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RTURN = [], IF USER IS NOT FOUND
            if (tokens.length < 1) {
                throw new ErrorHandler(401, "TOKEN DOESN'T EXIST");
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (tokens.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE TOKENS");
            }

            let user = await tokens[0].getUser();

            if (!user) {
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            let usersInfo = await user.getUsersInfos({
                where: {
                    status: "verified",
                    role: "primary"
                }
            });

            // RTURN = [], IF USER IS NOT FOUND
            if (usersInfo.length < 1) {
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (usersInfo.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE USERS");
            }

            var security = new Security(user.password);
            let userData = [];

            for (let i = 0; i < usersInfo.length; i++) {
                userData.push({
                    country_code: security.decrypt(usersInfo[i].country_code, usersInfo[i].iv),
                    phone_number: security.decrypt(usersInfo[i].phone_number, usersInfo[i].iv)
                });
            }

            return res.status(200).json(userData);
        } catch (error) {
            next(error)
        }
    });
}
// =============================================================