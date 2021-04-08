const {
    google
} = require('googleapis');
const credentials = require("../credentials.json");
const db = require("../models");
var Oauth2 = db.oauth2;
var User = db.users;
var Provider = db.providers;
const {
    Op
} = require("sequelize");
const {
    v4: uuidv4
} = require('uuid');


module.exports = (app) => {
    var oauth2ClientToken = ""
    var token_url = ""


    // generate a url that asks permissions for Blogger and Google Calendar scopes
    const token_scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];

    app.post('/oauth2/google/Tokens/', async (req, res, next) => {
        if (req.body.auth_key) {
            // let originalURL = req.get('host')
            let originalURL = req.body.origin

            oauth2ClientToken = new google.auth.OAuth2(
                credentials.google.GOOGLE_CLIENT_ID,
                credentials.google.GOOGLE_CLIENT_SECRET,
                `${originalURL}/oauth2/google/Tokens/redirect/`
            )

            token_url = oauth2ClientToken.generateAuthUrl({
                // 'online' (default) or 'offline' (gets refresh_token)
                access_type: 'offline',

                // If you only need one scope you can pass it as a string
                scope: token_scopes
            });

            return res.status(200).json({
                auth_key: req.body.auth_key,
                provider: req.body.provider,
                url: token_url
            });
        }
    });

    app.post('/google/auth/success', async (req, res, next) => {
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

        let oauth2 = await Oauth2.findAll({
            where: {
                profileId: profile.data.id
            }
        });

        if (oauth2[0]) {
            const error = new Error("Token already exist");
            error.httpStatusCode = 400;
            return next(error);
        }

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

        await Oauth2.create({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiry_date: tokens.expiry_date,
            scope: tokens.scope.split(" "),
            profile: profile,
            profileId: profile.data.id
        });

        await Oauth2.update({
            userId: user[0].id
        }, {
            where: {
                profileId: profile.data.id
            }
        })

        let provider = await Provider.findAll({
            where: {
                name: req.body.provider
            }
        })

        if (provider.length < 1) {
            const error = new Error("Invalid Provider");
            error.httpStatusCode = 401;
            return next(error);
        }

        if (provider.length > 1) {
            const error = new Error("duplicate providers");
            error.httpStatusCode = 401;
            return next(error);
        }

        await Oauth2.update({
            providerId: provider[0].id
        }, {
            where: {
                profileId: profile.data.id
            }
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

        let provider = await Provider.findAll({
            where: {
                id: req.body.providerId
            }
        })

        if (provider.length < 1) {
            const error = new Error("Invalid Provider");
            error.httpStatusCode = 401;
            return next(error);
        }

        if (provider.length > 1) {
            const error = new Error("duplicate providers");
            error.httpStatusCode = 401;
            return next(error);
        };

        let oauth2 = await Oauth2.findAll({
            where: {
                [Op.and]: [{
                    userId: user[0].id
                }, {
                    providerId: provider[0].id
                }]
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        if (oauth2.length < 1) {
            const error = new Error("Token doesn't exist");
            error.httpStatusCode = 401;
            return next(error);
        }

        if (oauth2.length > 1) {
            const error = new Error("duplicate Tokens");
            error.httpStatusCode = 409;
            return next(error);
        };

        await oauth2ClientToken.revokeToken(oauth2[0].accessToken).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        await oauth2[0].destroy().catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });;

        return res.status(200).json({
            message: "Token revoke success"
        });

    });

}