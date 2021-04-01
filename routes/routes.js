const db = require("../models");
var User = db.users;
var Providers = db.providers;
const {
    v4: uuidv4
} = require('uuid');
const {
    Op,
    QueryTypes
} = require("sequelize");

module.exports = (app) => {
    app.post("/users/profiles", async (req, res, next) => {
        if (req.body.phone_number) {
            let user = await User.findAll({
                where: {
                    phone_number: req.body.phone_number
                }
            }).catch(error => {
                error.httpStatusCode = 500
                return next(error);
            });

            if (user.length < 1) {
                const error = new Error("phone number doesn't exist");
                error.httpStatusCode = 401;
                return next(error);
            }

            if (user.length > 1) {
                const error = new Error("duplicate phone number");
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
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        if (user.length < 1) {
            const error = new Error("Invalid key");
            error.httpStatusCode = 401;
            return next(error);
        }

        if (user.length > 1) {
            const error = new Error("duplicate Users");
            error.httpStatusCode = 409;
            return next(error);
        }

        let token = await user[0].getOauth2s();

        if (token.length < 1) {
            return res.status(200).json([]);
        }

        // store tokens from db
        let userData = {
            user_token: []
        }

        // filter tokens by provider
        if (req.body.provider) {
            for (let i = 0; i < token.length; i++) {
                let provider = await token[i].getProvider({
                    where: {
                        name: `${req.body.provider}`
                    }
                });

                if (provider) {
                    userData.user_token.push({
                        provider: provider.name,
                        platform: provider.platform,
                        token: {
                            access_token: token[i].accessToken,
                            refresh_token: token[i].refreshToken,
                            expiry_date: token[i].expiry_date,
                            scope: token[i].scope
                        }
                    })
                }
            }
            return res.status(200).json(userData)
        }

        // get all tokens
        for (let i = 0; i < token.length; i++) {
            let provider = await token[i].getProvider();

            if (provider) {
                userData.user_token.push({
                    provider: provider.name,
                    platform: provider.platform,
                    token: {
                        access_token: token[i].accessToken,
                        refresh_token: token[i].refreshToken,
                        expiry_date: token[i].expiry_date,
                        scope: token[i].scope
                    }
                })
            }
        }
        return res.status(200).json(userData)
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

        if (!req.body.platform) {
            const error = new Error("platform cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };

        let provider = await Providers.findAll({
            where: {
                [Op.and]: [{
                    name: req.body.provider.toLowerCase()
                }, {
                    platform: req.body.platform.toLowerCase()
                }]
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        if (provider.length < 1) {
            const error = new Error("invalid provider or platform");
            error.httpStatusCode = 401;
            return next(error);
        }

        if (provider.length > 1) {
            const error = new Error("Duplicate provider");
            error.httpStatusCode = 409;
            return next(error);
        }

        let user = await User.findAll({
            where: {
                auth_key: req.body.auth_key
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        })

        if (user.length < 1) {
            const error = new Error("Invalid key");
            error.httpStatusCode = 401;
            return next(error);
        }

        if (user.length > 1) {
            const error = new Error("duplicate Users");
            error.httpStatusCode = 409;
            return next(error);
        }

        return res.redirect(`/oauth2/${provider[0].name}/Tokens/?iden=${user[0].id}&provider=${provider[0].id}`);
    });

    app.post("/users/profiles/register", async (req, res, next) => {
        if (!req.body.phone_number) {
            const error = new Error("phone number cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };

        if (!req.body.password) {
            const error = new Error("password cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };

        let user = await User.findAll({
            where: {
                phone_number: req.body.phone_number
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        if (user.length > 0) {
            const error = new Error("Duplicate phone numbers");
            error.httpStatusCode = 409;
            return next(error);
        };

        let newUser = await User.create({
            phone_number: req.body.phone_number,
            password: req.body.password
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        return res.status(200).json({
            message: `${newUser.phone_number} account sucessfully created`
        })
    });

    app.post("/users/profiles/login", async (req, res, next) => {
        if (!req.body.phone_number) {
            const error = new Error("phone number cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };

        if (!req.body.password) {
            const error = new Error("password cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };

        let user = await User.findAll({
            where: {
                [Op.and]: [{
                    phone_number: req.body.phone_number
                }, {
                    password: req.body.password
                }]
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        if (user.length < 1) {
            const error = new Error("invalid phone number or password");
            error.httpStatusCode = 401;
            return next(error);
        }

        if (user.length > 1) {
            const error = new Error("duplicate phone number");
            error.httpStatusCode = 401;
            return next(error);
        }

        await user[0].update({
            auth_key: uuidv4()
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        return res.status(200).json({
            auth_key: user[0].auth_key
        });
    })

    app.post("/users/providers", async (req, res, next) => {
        if (!req.body.auth_key) {
            const error = new Error("auth_key cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };

        let user = await User.findAll({
            where: {
                auth_key: req.body.auth_key
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        if (user.length < 1) {
            const error = new Error("Invalid key");
            error.httpStatusCode = 401;
            return next(error);
        }

        if (user.length > 1) {
            const error = new Error("duplicate Users");
            error.httpStatusCode = 409;
            return next(error);
        }

        let token = await user[0].getOauth2s();

        if (token.length < 1) {
            return res.status(200).json([]);
        }

        // store tokens from db
        let userData = {
            default_provider: [],
            user_provider: []
        }

        // get all tokens
        for (let i = 0; i < token.length; i++) {
            let provider = await token[i].getProvider();

            if (provider) {
                userData.user_provider.push({
                    provider: provider.name,
                    platform: provider.platform
                })
            }
        }

        let query = `SELECT t1.name, t1.platform FROM providers t1 LEFT JOIN oauth2s t2 ON t2.providerId = t1.id WHERE t2.providerId IS NULL`

        let defaultTokens = await db.sequelize.query(query, {
            type: QueryTypes.SELECT
        });

        if (defaultTokens.length > 0) {
            // get all tokens
            for (let i = 0; i < defaultTokens.length; i++) {
                userData.default_provider.push({
                    provider: defaultTokens[i].name,
                    platform: defaultTokens[i].platform
                })
            }
        }

        return res.status(200).json(userData)
    })
}