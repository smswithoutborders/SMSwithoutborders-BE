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
var security = new Security();

module.exports = (app) => {
    var oauth2ClientToken = ""
    var token_url = ""


    // generate a url that asks permissions for Blogger and Google Calendar scopes
    const token_scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    app.post('/oauth2/google/Tokens/', async (req, res, next) => {
        if (req.body.auth_key) {
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
                error.httpStatusCode = 500
                return next(error);
            })

            // RTURN = [], IF USER IS NOT FOUND
            if (user.length < 1) {
                const error = new Error("Invalid key");
                error.httpStatusCode = 401;
                return next(error);
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (user.length > 1) {
                const error = new Error("duplicate Users");
                error.httpStatusCode = 409;
                return next(error);
            }

            await user[0].update({
                auth_key: uuidv4()
            }).catch(error => {
                error.httpStatusCode = 500
                return next(error);
            });

            return res.status(200).json({
                auth_key: user[0].auth_key,
                provider: req.body.provider,
                platform: req.body.platform,
                url: token_url
            });
        }
    });

    app.post('/google/auth/success', async (req, res, next) => {
        // ==================== REQUEST BODY CHECKS ====================
        if (!req.body.auth_key) {
            const error = new Error("auth_key cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };

        if (!req.body.provider) {
            const error = new Error("provider cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };

        if (!req.body.platform) {
            const error = new Error("platform cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };
        // ===============================================================

        let code = req.body.code;
        let auth_key = req.body.auth_key;

        const {
            tokens
        } = await oauth2ClientToken.getToken(code).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });
        oauth2ClientToken.setCredentials(tokens);

        // get profile data
        var gmail = google.oauth2({
            auth: oauth2ClientToken,
            version: 'v2'
        });

        let profile = await gmail.userinfo.get();

        // let token = await Token.findAll({
        //     where: {
        //         profileId: profile.data.id
        //     }
        // });

        // if (token[0]) {
        //     const error = new Error("Token already exist");
        //     error.httpStatusCode = 400;
        //     return next(error);
        // }

        // SEARCH FOR USER IN DB
        let user = await User.findAll({
            where: {
                auth_key: auth_key
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        })

        // RTURN = [], IF USER IS NOT FOUND
        if (user.length < 1) {
            const error = new Error("Invalid key");
            error.httpStatusCode = 401;
            return next(error);
        }

        // IF MORE THAN ONE USER EXIST IN DATABASE
        if (user.length > 1) {
            const error = new Error("duplicate Users");
            error.httpStatusCode = 409;
            return next(error);
        }

        let new_token = await Token.create({
            profile: security.encrypt(JSON.stringify(profile)).e_info,
            token: security.encrypt(JSON.stringify(tokens)).e_info,
            iv: security.iv
        });

        await new_token.update({
            userId: user[0].id
        })

        let provider = await Provider.findAll({
            where: {
                name: req.body.provider.toLowerCase()
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        let platform = await Platform.findAll({
            where: {
                name: req.body.platform.toLowerCase()
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        // RETURN = [], IF PROVIDER NOT FOUND
        if (provider.length < 1 || platform.length < 1) {
            const error = new Error("invalid provider or platform");
            error.httpStatusCode = 401;
            return next(error);
        }

        // IF PROVIDER IS MORE THAN ONE IN DB
        if (provider.length > 1 || platform.length > 1) {
            const error = new Error("Duplicate provider or platform");
            error.httpStatusCode = 409;
            return next(error);
        };

        await new_token.update({
            providerId: provider[0].id,
            platformId: platform[0].id
        })

        await user[0].update({
            auth_key: uuidv4()
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        return res.status(200).json({
            auth_key: user[0].auth_key
        });
    });

    app.post('/oauth2/google/Tokens/revoke', async (req, res, next) => {
        // ==================== REQUEST BODY CHECKS ====================
        if (!req.body.provider) {
            const error = new Error("provider cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };

        if (!req.body.platform) {
            const error = new Error("platform cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };
        // ===============================================================

        let user = await User.findAll({
            where: {
                id: req.body.id
            }
        });

        if (user.length < 1) {
            const error = new Error("Invalid key");
            error.httpStatusCode = 401;
            return next(error);
        }

        if (user.length > 1) {
            const error = new Error("duplicate users");
            error.httpStatusCode = 401;
            return next(error);
        }

        let platform = await Platform.findAll({
            where: {
                id: req.body.platformId
            }
        })

        if (platform.length < 1) {
            const error = new Error("Invalid Platform");
            error.httpStatusCode = 401;
            return next(error);
        }

        if (platform.length > 1) {
            const error = new Error("duplicate Platforms");
            error.httpStatusCode = 401;
            return next(error);
        };

        let token = await Token.findAll({
            where: {
                [Op.and]: [{
                    userId: user[0].id
                }, {
                    platformId: provider[0].id
                }]
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        if (token.length < 1) {
            const error = new Error("Token doesn't exist");
            error.httpStatusCode = 401;
            return next(error);
        }

        if (token.length > 1) {
            const error = new Error("duplicate Tokens");
            error.httpStatusCode = 409;
            return next(error);
        };

        let originalURL = req.body.origin

        oauth2ClientToken = new google.auth.OAuth2(
            credentials.google.GOOGLE_CLIENT_ID,
            credentials.google.GOOGLE_CLIENT_SECRET,
            `${originalURL}/oauth2/google/Tokens/redirect/`
        );

        let fetch_tokens = JSON.parse(security.decrypt(token[0].token, token[0].iv));

        await oauth2ClientToken.setCredentials(fetch_tokens);

        await oauth2ClientToken.getAccessToken(async (err, access_token) => {
            if (err) {
                error.httpStatusCode = 500
                return next(err);
            }

            await oauth2ClientToken.revokeToken(access_token).catch(error => {
                error.httpStatusCode = 500
                return next(error);
            });

            await token[0].destroy().catch(error => {
                error.httpStatusCode = 500
                return next(error);
            });;

            return res.status(200).json({
                message: "Token revoke success"
            });
        });
    });

}