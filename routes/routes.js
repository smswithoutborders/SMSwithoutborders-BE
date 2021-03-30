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
            error.httpStatusCode = 401;
            return next(error);
        }

        let token = await user[0].getOauth2s();

        if (token.length < 1) {
            return res.status(200).json([]);
        }

        // store tokens from db
        let userData = []

        // filter tokens by provider
        if (req.body.provider) {
            for (let i = 0; i < token.length; i++) {
                let provider = await token[i].getProviders({
                    where: {
                        name: `${req.body.provider}`
                    }
                });

                if (provider.length > 0) {
                    userData.push({
                        [`${req.body.provider}`]: {
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
            userData.push({
                google: {
                    access_token: token[i].accessToken,
                    refresh_token: token[i].refreshToken,
                    expiry_date: token[i].expiry_date,
                    scope: token[i].scope
                }
            })
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

        let provider = await Providers.findAll({
            where: {
                name: req.body.provider.toLowerCase()
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
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
            error.httpStatusCode = 401;
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
}