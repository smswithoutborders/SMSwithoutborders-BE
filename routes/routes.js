const db = require("../models");
var User = db.users;
var Providers = db.providers;
const {
    v4: uuidv4
} = require('uuid');
const {
    Op
} = require("sequelize");

module.exports = (app) => {
    app.post("/users/profiles", async (req, res, next) => {
        if (req.body.phone_number) {
            let user = await User.findAll({
                where: {
                    phone_number: req.body.phone_number
                }
            });

            if (user.length < 1) {
                const error = new Error("phone number doesn't exist");
                error.httpStatusCode = 401;
                return next(error);
            }

            if (user.length > 1) {
                const error = new Error("duplicate phone number");
                error.httpStatusCode = 401;
                return next(error);
            }

            // console.log(uuidv4());
            await user[0].update({
                auth_key: uuidv4()
            });

            return res.status(200).json({
                auth_key: user[0].auth_key
            });
        }

        const error = new Error("phone number cannot be empty");
        error.httpStatusCode = 400;
        return next(error);
    });

    app.post("/users/stored_tokens", async (req, res, next) => {
        if (!req.body.auth_key) {
            const error = new Error("auth_key cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };

        let user = await User.findAll({
            where: {
                auth_key: req.body.auth_key
            }
        })

        if (user.length < 1) {
            const error = new Error("Invalid key");
            error.httpStatusCode = 401;
            return next(error);
        }

        if (user.length > 1) {
            const error = new Error("duplicate Users");
            error.httpStatusCode = 401;
            return next(error);
        }

        let token = await user[0].getOauth2s();
        let userData = {}
        if (token.length < 1) {
            userData = {};
            return res.status(200).json(userData);
        } else {
            userData.google = {
                token: {
                    access_token: token[0].accessToken,
                    refresh_token: token[0].refreshToken,
                    expiry_date: token[0].expiry_date,
                    scope: token[0].scope
                }
            };

            return res.status(200).json(userData);
        }
    })

    app.post("/users/tokens", async (req, res, next) => {
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

        let provider = await Providers.findAll({
            where: {
                name: req.body.provider.toLowerCase()
            }
        });

        if (provider.length < 1) {
            const error = new Error("invalid provider");
            error.httpStatusCode = 400;
            return next(error);
        }

        if (provider.length > 1) {
            const error = new Error("Duplicate provider");
            error.httpStatusCode = 400;
            return next(error);
        }

        let user = await User.findAll({
            where: {
                auth_key: req.body.auth_key
            }
        })

        if (user.length < 1) {
            const error = new Error("Invalid key");
            error.httpStatusCode = 401;
            return next(error);
        }

        if (user.length > 1) {
            const error = new Error("duplicate Users");
            error.httpStatusCode = 401;
            return next(error);
        }

        return res.redirect(`/oauth2/${provider[0].name}/Tokens/?iden=${user[0].id}&provider=${provider[0].id}`);
    });
}