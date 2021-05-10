const configs = require("./../config.json");
const db = require("../models");
var User = db.users;
var Provider = db.providers;
var Platform = db.platforms;
const fs = require('fs')
const {
    v4: uuidv4
} = require('uuid');
const {
    Op,
    QueryTypes
} = require("sequelize");
const Axios = require('axios');
const Security = require("../models/security.model.js");
var security = new Security();

var rootCas = require('ssl-root-cas').create()

require('https').globalAgent.options.ca = rootCas

if ((configs.hasOwnProperty("ssl_api") && configs.hasOwnProperty("PEM")) && fs.existsSync(configs.ssl_api.PEM)) {
    rootCas.addFile('/var/www/ssl/server.pem')
}
axios = Axios

module.exports = (app) => {
    app.post("/locals/users/hash1", async (req, res, next) => {
        // SEARCH FOR USER IN DB
        let user = await User.findAll({
            where: {
                id: req.body.id
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        // RETURN = [], IF NO USER FOUND
        if (user.length < 1) {
            const error = new Error("user doesn't exist");
            error.httpStatusCode = 401;
            return next(error);
        }

        // IF RETURN HAS MORE THAN ONE ITEM
        if (user.length > 1) {
            const error = new Error("duplicate user");
            error.httpStatusCode = 409;
            return next(error);
        }

        // RETURN PASSWORD HASH
        return res.status(200).json({
            password_hash: user[0].password
        });
    });

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

        if (!req.body.provider && !req.body.platform) {
            const error = new Error("Provider and Platform cannot be empty");
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
        let token = await user[0].getTokens();

        // RETURN = [], IF NO TOKEN EXIST UNDER CURRENT USER
        if (token.length < 1) {
            return res.status(200).json([]);
        }

        let userData = {
            user_token: []
        }

        // FILTER TOKENS BY PROVIDER AND PLATFORM
        if (req.body.provider && req.body.platform) {
            // LOOP THROUGH ALL TOKENS FOUND
            for (let i = 0; i < token.length; i++) {
                // GET REQUESTED PROVIDER FOR CURRENT TOKEN
                let platform = await token[i].getPlatform({
                    where: {
                        name: req.body.platform.toLowerCase()
                    }
                }).catch(error => {
                    error.httpStatusCode = 500
                    return next(error);
                });

                let provider = await token[i].getProvider({
                    where: {
                        name: req.body.provider.toLowerCase()
                    }
                }).catch(error => {
                    error.httpStatusCode = 500
                    return next(error);
                });

                // IF PROVIDER FOUND
                if (provider && platform) {
                    userData.user_token.push({
                        provider: provider.name,
                        platform: platform.name,
                        token: JSON.parse(security.decrypt(token[i].token, token[i].iv)),
                        profile: JSON.parse(security.decrypt(token[i].profile, token[i].iv))
                    })
                }
            }
            // RETURN STORED TOKEN AND PROVIDER
            return res.status(200).json(userData)
        }

        // FILTER TOKENS BY PROVIDER
        if (req.body.provider) {
            // LOOP THROUGH ALL TOKENS FOUND
            for (let i = 0; i < token.length; i++) {
                // GET REQUESTED PROVIDER FOR CURRENT TOKEN
                let provider = await token[i].getProvider({
                    where: {
                        name: req.body.provider.toLowerCase()
                    }
                }).catch(error => {
                    error.httpStatusCode = 500
                    return next(error);
                });

                let platform = await Platform.findAll({
                    where: {
                        id: token[i].platformId
                    }
                }).catch(error => {
                    error.httpStatusCode = 500
                    return next(error);
                });

                // IF PROVIDER FOUND
                if (provider && platform) {
                    userData.user_token.push({
                        provider: provider.name,
                        platform: platform.name,
                        token: JSON.parse(security.decrypt(token[i].token, token[i].iv)),
                        profile: JSON.parse(security.decrypt(token[i].profile, token[i].iv))
                    })
                }
            }
            // RETURN STORED TOKEN AND PROVIDER
            return res.status(200).json(userData)
        }

        // FILTER TOKENS BY PROVIDER
        if (req.body.platform) {
            // LOOP THROUGH ALL TOKENS FOUND
            for (let i = 0; i < token.length; i++) {
                let platform = await token[i].getPlatform({
                    where: {
                        name: req.body.platform.toLowerCase()
                    }
                }).catch(error => {
                    error.httpStatusCode = 500
                    return next(error);
                });

                // GET REQUESTED PROVIDER FOR CURRENT TOKEN
                let provider = await Provider.findAll({
                    where: {
                        id: token[i].providerId
                    }
                }).catch(error => {
                    error.httpStatusCode = 500
                    return next(error);
                });

                // IF PROVIDER FOUND
                if (provider && platform) {
                    userData.user_token.push({
                        provider: provider.name,
                        platform: platform.name,
                        token: JSON.parse(security.decrypt(token[i].token, token[i].iv)),
                        profile: JSON.parse(security.decrypt(token[i].profile, token[i].iv))
                    })
                }
            }
            // RETURN STORED TOKEN AND PROVIDER
            return res.status(200).json(userData)
        }
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

        let port = app.runningPort
        let originalURL = req.hostname
        console.log(">> OURL:", originalURL)
        await axios.post(`${app.is_ssl ? "https://" : "http://"}${originalURL}:${port}/oauth2/${provider[0].name}/Tokens/`, {
                auth_key: req.body.auth_key,
                provider: req.body.provider,
                origin: req.header('Origin')
            })
            .then(function (response) {
                return res.status(200).json(response.data);
            })
            .catch(function (error) {
                error.httpStatusCode = 500
                return next(error);
            });
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

        if (req.body.password.length < 15) {
            const error = new Error("password is less than 15 characters");
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
            password: security.hash(req.body.password)
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

        if (req.body.password.length < 15) {
            const error = new Error("password is less than 15 characters");
            error.httpStatusCode = 400;
            return next(error);
        };

        let user = await User.findAll({
            where: {
                [Op.and]: [{
                    phone_number: req.body.phone_number
                }, {
                    password: security.hash(req.body.password)
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

        let query = `SELECT t1.name , t3.name platform
        FROM providers t1
        INNER JOIN platforms t3 ON t1.id = t3.providerId
        LEFT JOIN (SELECT * FROM tokens WHERE tokens.userId = ${user[0].id}) AS t2 
        ON t2.platformId = t3.id 
        WHERE t2.platformId IS NULL `

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

        let token = await user[0].getTokens();

        if (token.length < 1) {
            return res.status(200).json(userData);
        }

        // get all tokens
        for (let i = 0; i < token.length; i++) {
            let provider = await token[i].getProvider();
            let platform = await token[i].getPlatform();

            if (provider) {
                userData.user_provider.push({
                    provider: provider.name,
                    platform: platform.name
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

        if (req.body.password.length < 15) {
            const error = new Error("password is less than 15 characters");
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
        let provider = await Provider.findAll({
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
                    password: security.hash(req.body.password)
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

        let port = app.runningPort
        let originalURL = req.hostname
        await axios.post(`${app.is_ssl ? "https://" : "http://"}${originalURL}:${port}/oauth2/${provider[0].name}/Tokens/revoke`, {
                id: user[0].id,
                providerId: provider[0].id,
                origin: req.header('Origin')
            })
            .then(function (response) {
                return res.status(200).json(response.data);
            })
            .catch(function (error) {
                error.httpStatusCode = 500
                return next(error);
            });
    });
}