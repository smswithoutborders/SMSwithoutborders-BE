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
            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    phone_number: req.body.phone_number
                }
            }).catch(error => {
                error.httpStatusCode = 500
                return next(error);
            });

            // RETURN = [], IF NO USER FOUND
            if (user.length < 1) {
                const error = new Error("phone number doesn't exist");
                error.httpStatusCode = 401;
                return next(error);
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (user.length > 1) {
                const error = new Error("duplicate phone number");
                error.httpStatusCode = 409;
                return next(error);
            }

            // CREATE AUTH_KEY ON LOGIN
            await user[0].update({
                auth_key: uuidv4()
            }).catch(error => {
                error.httpStatusCode = 500
                return next(error);
            });

            // RETURN AUTH_KEY
            return res.status(200).json({
                auth_key: user[0].auth_key
            });
        }

        // IF PHONE NUMBER FIELD IS EMPTY
        const error = new Error("phone number cannot be empty");
        error.httpStatusCode = 400;
        return next(error);
    });

    app.post("/users/stored_tokens", async (req, res, next) => {
        // ==================== REQUEST BODY CHECKS ====================
        if (!req.body.auth_key) {
            const error = new Error("auth_key cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };
        // =============================================================

        // SEARCH FOR USER IN DB
        let user = await User.findAll({
            where: {
                auth_key: req.body.auth_key
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        // RETURN = [], IF USER NOT FOUND
        if (user.length < 1) {
            const error = new Error("Invalid key");
            error.httpStatusCode = 401;
            return next(error);
        }

        // IF RETURN HAS MORE THAN ONE ITEM
        if (user.length > 1) {
            const error = new Error("duplicate Users");
            error.httpStatusCode = 409;
            return next(error);
        }

        // GET ALL TOKENS UNDER CURRENT USER
        let token = await user[0].getOauth2s();

        // RETURN = [], IF NO TOKEN EXIST UNDER CURRENT USER
        if (token.length < 1) {
            return res.status(200).json([]);
        }

        let userData = {
            user_token: []
        }

        // FILTER TOKENS BY PROVIDER
        if (req.body.provider) {
            // LOOP THROUGH ALL TOKENS FOUND
            for (let i = 0; i < token.length; i++) {
                // GET REQUESTED PROVIDER FOR CURRENT TOKEN
                let provider = await token[i].getProvider({
                    where: {
                        name: `${req.body.provider}`
                    }
                }).catch(error => {
                    error.httpStatusCode = 500
                    return next(error);
                });

                // IF PROVIDER FOUND
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
            // RETURN STORED TOKEN AND PROVIDER
            return res.status(200).json(userData)
        }

        // LOOP THROUGH ALL TOKENS FOUND
        for (let i = 0; i < token.length; i++) {
            // GET ALL TOKENS UNDER CURRENT USER
            let provider = await token[i].getProvider().catch(error => {
                error.httpStatusCode = 500
                return next(error);
            });

            // IF PROVIDER FOUND
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

        // RETURN STORED TOKENS AND PROVIDER
        return res.status(200).json(userData)
    })

    app.post("/users/tokens", async (req, res, next) => {
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

        // SEARCH FOR PROVIDER AND PLATFORM IN DB
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

        // RETURN = [], IF PROVIDER NOT FOUND
        if (provider.length < 1) {
            const error = new Error("invalid provider or platform");
            error.httpStatusCode = 401;
            return next(error);
        }

        // IF PROVIDER IS MORE THAN ONE IN DB
        if (provider.length > 1) {
            const error = new Error("Duplicate provider");
            error.httpStatusCode = 409;
            return next(error);
        }

        // SEARCH FOR USER IN DB
        let user = await User.findAll({
            where: {
                auth_key: req.body.auth_key
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

        // RETURN FOUND USER AND PROVIDER
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

        // store tokens from db
        let userData = {
            default_provider: [],
            user_provider: []
        }

        let query = `SELECT t1.name, t1.platform 
        FROM providers t1 
        LEFT JOIN (SELECT * FROM oauth2s WHERE oauth2s.userId = ${user[0].id}) AS t2 
        ON t2.providerId = t1.id 
        WHERE t2.providerId IS NULL `

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

        let token = await user[0].getOauth2s();

        if (token.length < 1) {
            return res.status(200).json(userData);
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

        return res.status(200).json(userData)
    });

    app.post("/users/tokens/revoke", async (req, res, next) => {
        // ==================== REQUEST BODY CHECKS ====================
        if (!req.body.auth_key) {
            const error = new Error("auth_key cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };

        if (!req.body.password) {
            const error = new Error("password cannot be empty");
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

        // SEARCH FOR PROVIDER AND PLATFORM IN DB
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

        // RETURN = [], IF PROVIDER NOT FOUND
        if (provider.length < 1) {
            const error = new Error("invalid provider or platform");
            error.httpStatusCode = 401;
            return next(error);
        }

        // IF PROVIDER IS MORE THAN ONE IN DB
        if (provider.length > 1) {
            const error = new Error("Duplicate provider");
            error.httpStatusCode = 409;
            return next(error);
        }

        // SEARCH FOR USER IN DB
        let user = await User.findAll({
            where: {
                [Op.and]: [{
                    auth_key: req.body.auth_key
                }, {
                    password: req.body.password
                }]
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        })

        // RTURN = [], IF USER IS NOT FOUND
        if (user.length < 1) {
            const error = new Error("Invalid key or wrong password");
            error.httpStatusCode = 401;
            return next(error);
        }

        // IF MORE THAN ONE USER EXIST IN DATABASE
        if (user.length > 1) {
            const error = new Error("duplicate Users");
            error.httpStatusCode = 409;
            return next(error);
        }

        // RETURN FOUND USER AND PROVIDER
        return res.redirect(`/oauth2/${provider[0].name}/Tokens/revoke/?iden=${user[0].id}&provider=${provider[0].id}`);
    });

    app.post("/users/oauth2/login", async (req, res, next) => {
        // ==================== REQUEST BODY CHECKS ====================
        if (!req.body.provider) {
            const error = new Error("provider cannot be empty");
            error.httpStatusCode = 400;
            return next(error);
        };
        // ===============================================================

        // REDIRECT TO PROVIDER
        return res.redirect(`/oauth2/${req.body.provider.toLowerCase()}/login/`);
    });

    app.post("/users/oauth2/register", async (req, res, next) => {
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

        if (!req.body.auth_key) {
            const error = new Error("auth_key cannot be empty");
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

        let newUser = await User.findAll({
            where: {
                auth_key: req.body.auth_key
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        // RTURN = [], IF USER IS NOT FOUND
        if (newUser.length < 1) {
            const error = new Error("Invalid key");
            error.httpStatusCode = 401;
            return next(error);
        }

        // IF MORE THAN ONE USER EXIST IN DATABASE
        if (newUser.length > 1) {
            const error = new Error("duplicate Users");
            error.httpStatusCode = 409;
            return next(error);
        }

        await newUser[0].update({
            phone_number: req.body.phone_number,
            password: req.body.password
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        await newUser[0].update({
            auth_key: uuidv4()
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        return res.status(200).json({
            auth_key: newUser[0].auth_key
        });
    });
}