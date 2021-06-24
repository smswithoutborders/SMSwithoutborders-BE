const {
    google
} = require('googleapis');
const credentials = require("../credentials.json");
const db = require("../models");
var Token = db.tokens;
var User = db.users;
var Provider = db.providers;
var Platform = db.platforms;
const {
    Op
} = require("sequelize");
const {
    v4: uuidv4
} = require('uuid');
const Security = require("../models/security.models.js");
const {
    ErrorHandler
} = require("./error.js");
// =========================================================================================================================

module.exports = (app) => {
    var oauth2ClientToken = ""
    var token_url = ""

    // requested scopes
    const token_scopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    app.post('/oauth2/google/Tokens/', async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (!req.body.origin) {
                throw new ErrorHandler(400, "Origin cannot be empty");
            };

            if (!req.body.provider) {
                throw new ErrorHandler(400, "Provider cannot be empty");
            };

            if (!req.body.platform) {
                throw new ErrorHandler(400, "Platform cannot be empty");
            };
            // ===============================================================

            let auth_key = req.body.auth_key;

            // let originalURL = req.get('host')
            let originalURL = req.body.origin

            oauth2ClientToken = new google.auth.OAuth2(
                credentials.google.GOOGLE_CLIENT_ID,
                credentials.google.GOOGLE_CLIENT_SECRET,
                `${originalURL}/dashboard/oauth2/google/Tokens/redirect/`
            )

            token_url = oauth2ClientToken.generateAuthUrl({
                // 'online' (default) or 'offline' (gets refresh_token)
                access_type: 'offline',

                // If you only need one scope you can pass it as a string
                scope: token_scopes
            });

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    auth_key: auth_key
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            })

            // RTURN = [], IF USER IS NOT FOUND
            if (user.length < 1) {
                throw new ErrorHandler(401, "User doesn't exist");
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (user.length > 1) {
                throw new ErrorHandler(409, "Duplicate Users");
            }

            await user[0].update({
                auth_key: uuidv4()
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            return res.status(200).json({
                auth_key: user[0].auth_key,
                provider: req.body.provider,
                platform: req.body.platform,
                url: token_url
            });
        } catch (error) {
            next(error)
        }
    });

    app.post('/google/auth/success', async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.id) {
                throw new ErrorHandler(400, "Id cannot be empty");
            };

            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (!req.body.provider) {
                throw new ErrorHandler(400, "Provider cannot be empty");
            };

            if (!req.body.platform) {
                throw new ErrorHandler(400, "Platform cannot be empty");
            };

            if (!req.body.code) {
                throw new ErrorHandler(400, "Code cannot be empty");
            };
            // =============================================================

            let originalURL = req.header("Origin");

            oauth2ClientToken = new google.auth.OAuth2(
                credentials.google.GOOGLE_CLIENT_ID,
                credentials.google.GOOGLE_CLIENT_SECRET,
                `${originalURL}/dashboard/oauth2/google/Tokens/redirect/`
            );

            let provider = await Provider.findAll({
                where: {
                    name: req.body.provider.toLowerCase()
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            let platform = await Platform.findAll({
                where: {
                    name: req.body.platform.toLowerCase()
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN = [], IF PROVIDER NOT FOUND
            if (provider.length < 1) {
                throw new ErrorHandler(401, "INVALD PROVIDER");
            }

            // RETURN = [], IF PLATFORM NOT FOUND
            if (platform.length < 1) {
                throw new ErrorHandler(401, "INVALD PLATFORM");
            }

            // IF PROVIDER IS MORE THAN ONE IN DB
            if (provider.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE PROVIDERS");
            }

            // IF PLATFORM IS MORE THAN ONE IN DB
            if (platform.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE PLATFORMS");
            }

            let token = await Token.findAll({
                where: {
                    userId: req.body.id,
                    providerId: provider[0].id,
                    platformId: platform[0].id
                }
            });

            if (token[0]) {
                throw new ErrorHandler(409, "DUPLICATE TOKENS");
            }

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    id: req.body.id
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            })

            // RTURN = [], IF USER IS NOT FOUND
            if (user.length < 1) {
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (user.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE USERS");
            }

            var security = new Security(user[0].password);

            // CHECK AUTH_KEY
            let auth_key = user[0].auth_key;

            if (auth_key != req.body.auth_key) {
                throw new ErrorHandler(401, "INVALID AUTH_KEY");
            }

            let code = req.body.code;

            const {
                tokens
            } = await oauth2ClientToken.getToken(code).catch(error => {
                throw new ErrorHandler(500, error);
            });
            oauth2ClientToken.setCredentials(tokens);

            // get profile data
            var gmail = google.oauth2({
                auth: oauth2ClientToken,
                version: 'v2'
            });

            let profile = await gmail.userinfo.get();

            let new_token = await Token.create({
                profile: security.encrypt(JSON.stringify(profile)).e_info,
                token: security.encrypt(JSON.stringify(tokens)).e_info,
                iv: security.iv
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            await new_token.update({
                userId: user[0].id,
                providerId: provider[0].id,
                platformId: platform[0].id
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            await user[0].update({
                auth_key: uuidv4()
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            return res.status(200).json({
                auth_key: user[0].auth_key
            });
        } catch (error) {
            next(error)
        }
    });

    app.post('/oauth2/google/Tokens/revoke', async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.platformId) {
                throw new ErrorHandler(400, "platformId cannot be empty");
            };

            if (!req.body.providerId) {
                throw new ErrorHandler(400, "ProviderId cannot be empty");
            };

            if (!req.body.id) {
                throw new ErrorHandler(400, "UserId cannot be empty");
            };

            if (!req.body.origin) {
                throw new ErrorHandler(400, "Origin cannot be empty");
            };
            // ===============================================================

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

            let originalURL = req.body.origin

            let token = await Token.findAll({
                where: {
                    [Op.and]: [{
                        userId: req.body.id
                    }, {
                        platformId: req.body.platformId
                    }, {
                        providerId: req.body.providerId
                    }]
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            if (token.length < 1) {
                throw new ErrorHandler(401, "TOKEN DOESN'T EXIST");
            }

            if (token.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE TOKENS");
            };

            oauth2ClientToken = new google.auth.OAuth2(
                credentials.google.GOOGLE_CLIENT_ID,
                credentials.google.GOOGLE_CLIENT_SECRET,
                `${originalURL}/dashboard/oauth2/google/Tokens/redirect/`
            );

            let fetch_tokens = JSON.parse(security.decrypt(token[0].token, token[0].iv));

            await oauth2ClientToken.setCredentials(fetch_tokens);

            await oauth2ClientToken.getAccessToken(async (err, access_token) => {
                if (err) {
                    throw new ErrorHandler(500, error);
                }

                await oauth2ClientToken.revokeToken(access_token).catch(error => {
                    throw new ErrorHandler(500, error);
                });

                await token[0].destroy().catch(error => {
                    throw new ErrorHandler(500, error);
                });;

                return res.status(200).json({
                    message: "Token revoke success"
                });
            });
        } catch (error) {
            next(error);
        }
    });
}