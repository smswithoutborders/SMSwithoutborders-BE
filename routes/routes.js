const fs = require('fs')
const {
    v4: uuidv4
} = require('uuid');
const {
    Op,
    QueryTypes
} = require("sequelize");
const Axios = require('axios');
const Security = require("../models/security.models.js");
const {
    ErrorHandler
} = require('../controllers/error.js')

var rootCas = require('ssl-root-cas').create()

require('https').globalAgent.options.ca = rootCas

axios = Axios
// =========================================================================================================================

// ==================== PRODUCTION ====================
let production = (app, configs, db) => {
    var User = db.users;
    var Provider = db.providers;
    var Platform = db.platforms;

    if ((configs.hasOwnProperty("ssl_api") && configs.hasOwnProperty("PEM")) && fs.existsSync(configs.ssl_api.PEM)) {
        rootCas.addFile('/var/www/ssl/server.pem')
    }

    app.post("/users/stored_tokens", async (req, res, next) => {
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
            // =============================================================

            let userData = {
                user_token: []
            }

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    id: req.body.id
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RETURN = [], IF USER NOT FOUND
            if (user.length < 1) {
                throw new ErrorHandler(401, "User doesn't exist");
            }

            // IF RETURN HAS MORE THAN ONE ITEM
            if (user.length > 1) {
                throw new ErrorHandler(409, "Duplicate Users");
            }

            var security = new Security(user[0].password);

            // CHECK AUTH_KEY
            let auth_key = security.decrypt(user[0].auth_key, user[0].iv);

            if (auth_key != req.body.auth_key) {
                throw new ErrorHandler(401, "INVALID AUTH_KEY");
            }

            // GET ALL TOKENS UNDER CURRENT USER
            let token = await user[0].getTokens();

            // RETURN = [], IF NO TOKEN EXIST UNDER CURRENT USER
            if (token.length < 1) {
                return res.status(200).json([]);
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
                        throw new ErrorHandler(500, error);
                    });

                    let provider = await token[i].getProvider({
                        where: {
                            name: req.body.provider.toLowerCase()
                        }
                    }).catch(error => {
                        throw new ErrorHandler(500, error);
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
                        throw new ErrorHandler(500, error);
                    });

                    let platform = await Platform.findAll({
                        where: {
                            id: token[i].platformId
                        }
                    }).catch(error => {
                        throw new ErrorHandler(500, error);
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
                        throw new ErrorHandler(500, error);
                    });

                    // GET REQUESTED PROVIDER FOR CURRENT TOKEN
                    let provider = await Provider.findAll({
                        where: {
                            id: token[i].providerId
                        }
                    }).catch(error => {
                        throw new ErrorHandler(500, error);
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
        } catch (error) {
            next(error)
        }
    })

    app.post("/users/tokens", async (req, res, next) => {
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
            // =============================================================

            // SEARCH FOR PROVIDER IN DB
            let provider = await Provider.findAll({
                where: {
                    name: req.body.provider.toLowerCase()
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // SEARCH FOR PLATFORM IN DB
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
                throw new ErrorHandler(401, "User doesn't exist");
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (user.length > 1) {
                throw new ErrorHandler(409, "Duplicate Users");
            }

            var security = new Security(user[0].password);

            // CHECK AUTH_KEY
            let auth_key = security.decrypt(user[0].auth_key, user[0].iv);

            if (auth_key != req.body.auth_key) {
                throw new ErrorHandler(401, "INVALID AUTH_KEY");
            }

            let port = app.runningPort
            let originalURL = req.hostname
            console.log(">> OURL:", originalURL)
            await axios.post(`${app.is_ssl ? "https://" : "http://"}${originalURL}:${port}/oauth2/${provider[0].name}/Tokens/`, {
                    auth_key: req.body.auth_key,
                    provider: req.body.provider,
                    platform: req.body.platform,
                    origin: req.header('Origin')
                })
                .then(function (response) {
                    return res.status(200).json(response.data);
                })
                .catch(function (error) {
                    throw new ErrorHandler(500, error);
                });
        } catch (error) {
            next(error);
        }
    });

    app.post("/users/profiles/register", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.phone_number) {
                throw new ErrorHandler(400, "phone number cannot be empty");
            };

            if (!req.body.password) {
                throw new ErrorHandler(400, "password cannot be empty");
            };

            if (req.body.password.length < 15) {
                throw new ErrorHandler(400, "password is less than 15 characters");
            };
            // ===============================================================

            let user = await User.findAll({
                where: {
                    phone_number: req.body.phone_number
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            if (user.length > 0) {
                throw new ErrorHandler(409, "Duplicate phone numbers");
            };

            var security = new Security();

            let newUser = await User.create({
                phone_number: req.body.phone_number,
                password: security.hash(req.body.password)
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            return res.status(200).json({
                message: `${newUser.phone_number} account sucessfully created`
            })
        } catch (error) {
            next(error);
        }
    });

    app.post("/users/profiles/login", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.phone_number) {
                throw new ErrorHandler(400, "phone number cannot be empty");
            };

            if (!req.body.password) {
                throw new ErrorHandler(400, "password cannot be empty");
            };

            if (req.body.password.length < 15) {
                throw new ErrorHandler(400, "password is less than 15 characters");
            };
            // ===============================================================

            let user = await User.findAll({
                where: {
                    phone_number: req.body.phone_number
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

            // PASSWORD AUTH
            if (user[0].password != security.hash(req.body.password)) {
                throw new ErrorHandler(401, "INVALID PASSWORD");
            }

            await user[0].update({
                auth_key: security.encrypt(uuidv4()).e_info,
                iv: security.iv
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            return res.status(200).json({
                id: user[0].id,
                auth_key: security.decrypt(user[0].auth_key, user[0].iv)
            });
        } catch (error) {
            next(error);
        }
    })

    app.post("/users/providers", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.id) {
                throw new ErrorHandler(400, "Id cannot be empty");
            };

            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };
            // =============================================================

            // store tokens from db
            let userData = {
                default_provider: [],
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

            // CHECK AUTH_KEY
            let auth_key = security.decrypt(user[0].auth_key, user[0].iv);

            if (auth_key != req.body.auth_key) {
                throw new ErrorHandler(401, "INVALID AUTH_KEY");
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

    app.post("/users/tokens/revoke", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.id) {
                throw new ErrorHandler(400, "Id cannot be empty");
            };

            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (!req.body.password) {
                throw new ErrorHandler(400, "Password cannot be empty");
            };

            if (req.body.password.length < 15) {
                throw new ErrorHandler(400, "password is less than 15 characters");
            };

            if (!req.body.provider) {
                throw new ErrorHandler(400, "provider cannot be empty");
            };

            if (!req.body.platform) {
                throw new ErrorHandler(400, "platform cannot be empty");
            };
            // ===============================================================

            // SEARCH FOR PROVIDER IN DB
            let provider = await Provider.findAll({
                where: {
                    name: req.body.provider.toLowerCase()
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // SEARCH FOR PLATFORM IN DB
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
                throw new ErrorHandler(401, "User doesn't exist");
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (user.length > 1) {
                throw new ErrorHandler(409, "Duplicate Users");
            }

            var security = new Security(user[0].password);

            // PASSWORD AUTH
            if (user[0].password != security.hash(req.body.password)) {
                throw new ErrorHandler(401, "INVALID PASSWORD");
            }

            // CHECK AUTH_KEY
            let auth_key = security.decrypt(user[0].auth_key, user[0].iv);

            if (auth_key != req.body.auth_key) {
                throw new ErrorHandler(401, "INVALID AUTH_KEY");
            }

            let port = app.runningPort
            let originalURL = req.hostname
            await axios.post(`${app.is_ssl ? "https://" : "http://"}${originalURL}:${port}/oauth2/${provider[0].name}/Tokens/revoke`, {
                    id: user[0].id,
                    providerId: provider[0].id,
                    platformId: platform[0].id,
                    origin: req.header('Origin')
                })
                .then(function (response) {
                    return res.status(200).json(response.data);
                })
                .catch(function (error) {
                    throw new ErrorHandler(500, error);
                });
        } catch (error) {
            next(error);
        }
    });

    app.post("/users/profiles/info", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.id) {
                throw new ErrorHandler(400, "Id cannot be empty");
            };

            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };
            // =============================================================

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

            // CHECK AUTH_KEY
            let auth_key = security.decrypt(user[0].auth_key, user[0].iv);

            if (auth_key != req.body.auth_key) {
                throw new ErrorHandler(401, "INVALID AUTH_KEY");
            }

            let profile_info = {
                id: user[0].id,
                phone_number: user[0].phone_number,
                last_login: user[0].updatedAt,
                created: user[0].createdAt
            }

            return res.status(200).json(profile_info);
        } catch (error) {
            next(error)
        }
    });
}
// =============================================================

// =========================================================================================================================

// ==================== DEVELOPMENT ====================
let development = (app, configs, db) => {
    var User = db.users;

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
            if (!req.body.phone_number) {
                throw new ErrorHandler(400, "Phone_number cannot be empty");
            };
            // =============================================================

            // SEARCH FOR USER IN DB
            let user = await User.findAll({
                where: {
                    phone_number: req.body.phone_number
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

            var security = new Security(user[0].password);

            // CREATE AUTH_KEY ON LOGIN
            await user[0].update({
                auth_key: security.encrypt(uuidv4()).e_info,
                iv: security.iv
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            return res.status(200).json({
                id: user[0].id,
                auth_key: security.decrypt(user[0].auth_key, user[0].iv)
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
}
// =============================================================

module.exports = {
    production,
    development
}