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
const credentials = require("../credentials.json");
const GlobalSecurity = new Security()
const {
    ErrorHandler
} = require('../controllers/error.js')
const _2FA = require("../models/2fa.models.js");

var rootCas = require('ssl-root-cas').create()

require('https').globalAgent.options.ca = rootCas

axios = Axios
// =========================================================================================================================

// ==================== PRODUCTION ====================
let production = (app, configs, db) => {
    var User = db.users;
    var UsersInfo = db.usersInfo;
    var Provider = db.providers;
    var Platform = db.platforms;
    var SmsVerification = db.smsVerification;

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
            let auth_key = user[0].auth_key;

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
            let auth_key = user[0].auth_key;

            if (auth_key != req.body.auth_key) {
                throw new ErrorHandler(401, "INVALID AUTH_KEY");
            }

            let port = app.runningPort
            let originalURL = req.hostname
            // console.log(">> OURL:", originalURL)
            await axios.post(`${app.is_ssl ? "https://" : "http://"}${originalURL}:${port}/oauth2/${provider[0].name}/Tokens/`, {
                    auth_key: req.body.auth_key,
                    provider: req.body.provider,
                    platform: req.body.platform,
                    origin: req.header("Origin")
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

            if (!req.body.name) {
                throw new ErrorHandler(400, "User_name cannot be empty");
            };

            if (!req.body.country_code) {
                throw new ErrorHandler(400, "User_country_code cannot be empty");
            };

            if (!req.body.password) {
                throw new ErrorHandler(400, "password cannot be empty");
            };

            if (req.body.password.length < 8) {
                throw new ErrorHandler(400, "password is less than 8 characters");
            };
            // ===============================================================

            let usersInfo = await UsersInfo.findAll({
                where: {
                    full_phone_number: GlobalSecurity.hash(req.body.country_code + req.body.phone_number),
                    role: "primary",
                    status: "verified"
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (usersInfo.length > 0) {
                throw new ErrorHandler(409, "DUPLICATE USERS");
            }

            let newUser = await User.create({
                password: GlobalSecurity.hash(req.body.password),
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            await UsersInfo.create({
                phone_number: req.body.phone_number,
                name: req.body.name,
                country_code: req.body.country_code,
                full_phone_number: req.body.country_code + req.body.phone_number,
                userId: newUser.id
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            let _2fa = new _2FA();

            let url = configs.TWILIO_ENDPOINT[0];
            let number = req.body.country_code + req.body.phone_number;
            let auth_token = credentials.twilio.AUTH_TOKEN;

            let _2fa_data = await _2fa.send(url, number, auth_token, next);

            if (_2fa_data) {
                let SV = await SmsVerification.create({
                    userId: newUser.id,
                    session_id: _2fa_data.service_sid,
                }).catch(error => {
                    throw new ErrorHandler(500, error);
                });

                return res.status(200).json({
                    session_id: SV.session_id,
                    svid: SV.svid
                })
            }
        } catch (error) {
            next(error);
        }
    });

    app.post("/users/profiles/register/2fa", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.code) {
                throw new ErrorHandler(400, "Code cannot be empty");
            };

            if (!req.body.session_id) {
                throw new ErrorHandler(400, "Session ID cannot be empty");
            };

            if (!req.body.svid) {
                throw new ErrorHandler(400, "SVID cannot be empty");
            };
            // ===============================================================

            let SV = await SmsVerification.findAll({
                where: {
                    session_id: req.body.session_id,
                    svid: req.body.svid
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            if (SV.length < 1) {
                throw new ErrorHandler(401, "INVALID VERIFICATION SESSION");
            };

            if (SV.length > 1) {
                throw new ErrorHandler(401, "DUPLICATE VERIFICATION SESSIONS");
            };

            let user = await SV[0].getUser();

            if (!user) {
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            let usersInfo = await user.getUsersInfos();

            // RTURN = [], IF USER IS NOT FOUND
            if (usersInfo.length < 1) {
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (usersInfo.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE USERS");
            }

            if (usersInfo[0].status == "verified") {
                throw new ErrorHandler(401, "USER ALREADY VERIFED");
            }

            let security = new Security(user.password);

            let _2fa = new _2FA();

            let url = configs.TWILIO_ENDPOINT[1];
            let number = usersInfo[0].full_phone_number;
            let code = req.body.code;
            let session_id = req.body.session_id;
            let auth_token = credentials.twilio.AUTH_TOKEN;

            let _2fa_data = await _2fa.verify(url, number, session_id, code, auth_token, next);

            if (_2fa_data) {
                if (_2fa_data.verification_status == "approved") {
                    await usersInfo[0].update({
                        phone_number: security.hash(usersInfo[0].phone_number),
                        name: security.encrypt(usersInfo[0].name).e_info,
                        country_code: security.encrypt(usersInfo[0].country_code).e_info,
                        full_phone_number: security.hash(usersInfo[0].country_code + usersInfo[0].phone_number),
                        status: "verified",
                        iv: security.iv
                    }).catch(error => {
                        throw new ErrorHandler(500, error);
                    });

                    return res.status(200).json({
                        message: "ACCOUNT SUCCESFULLY CREATED"
                    })
                };

                if (_2fa_data.verification_status == "pending") {
                    return res.status(401).json({
                        message: "INVALID VERIFICATION CODE"
                    })
                }
            }
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

            if (req.body.password.length < 8) {
                throw new ErrorHandler(400, "password is less than 8 characters");
            };
            // ===============================================================

            let usersInfo = await UsersInfo.findAll({
                where: {
                    full_phone_number: GlobalSecurity.hash(req.body.phone_number),
                    role: "primary",
                    status: "verified"
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (usersInfo.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE USERS EXIST");
            }

            // RTURN = [], IF USER IS NOT FOUND
            if (usersInfo.length < 1) {
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            let user = await usersInfo[0].getUser({
                where: {
                    password: GlobalSecurity.hash(req.body.password)
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            if (!user) {
                throw new ErrorHandler(401, "INVALID PASSWORD");
            };

            await user.update({
                auth_key: uuidv4()
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            return res.status(200).json({
                id: user.id,
                auth_key: user.auth_key
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
            let auth_key = user[0].auth_key;

            if (auth_key != req.body.auth_key) {
                throw new ErrorHandler(401, "INVALID AUTH_KEY");
            }

            let query = `SELECT t1.name , t1.description, t1.letter , t3.name platform_name , t3.type platform_type, t3.letter platform_letter
                        FROM providers t1
                        INNER JOIN platforms t3 ON t1.id = t3.providerId
                        LEFT JOIN (SELECT * FROM tokens WHERE tokens.userId = "${user[0].id}") AS t2 
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
                        description: defaultTokens[i].description,
                        letter: defaultTokens[i].letter,
                        platforms: [{
                            name: defaultTokens[i].platform_name,
                            type: defaultTokens[i].platform_type,
                            letter: defaultTokens[i].platform_letter
                        }]
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
                        description: provider.description,
                        letter: provider.letter,
                        platforms: [{
                            name: platform.name,
                            type: platform.type,
                            letter: platform.letter
                        }],
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

            if (req.body.password.length < 8) {
                throw new ErrorHandler(400, "password is less than 8 characters");
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
            let auth_key = user[0].auth_key;

            if (auth_key != req.body.auth_key) {
                throw new ErrorHandler(401, "INVALID AUTH_KEY");
            }

            let port = app.runningPort
            let originalURL = req.hostname
            await axios.post(`${app.is_ssl ? "https://" : "http://"}${originalURL}:${port}/oauth2/${provider[0].name}/Tokens/revoke`, {
                    id: user[0].id,
                    providerId: provider[0].id,
                    platformId: platform[0].id,
                    origin: req.header("Origin")
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

            let usersInfo = await user[0].getUsersInfos({
                where: {
                    status: "verified"
                }
            });

            // RTURN = [], IF USER IS NOT FOUND
            if (usersInfo.length < 1) {
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            var security = new Security(user[0].password);

            // CHECK AUTH_KEY
            let auth_key = user[0].auth_key;

            if (auth_key != req.body.auth_key) {
                throw new ErrorHandler(401, "INVALID AUTH_KEY");
            }

            let profile_info = {
                id: user[0].id,
                phone_number: usersInfo[0].phone_number,
                name: security.decrypt(usersInfo[0].name, usersInfo[0].iv),
                country_code: security.decrypt(usersInfo[0].country_code, usersInfo[0].iv),
                last_login: user[0].updatedAt,
                created: user[0].createdAt
            }

            return res.status(200).json(profile_info);
        } catch (error) {
            next(error)
        }
    });

    app.post("/users/password/new", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.id) {
                throw new ErrorHandler(400, "Id cannot be empty");
            };

            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (req.body.new_password.length < 8) {
                throw new ErrorHandler(400, "New Password is less than 8 characters");
            };

            if (!req.body.password) {
                throw new ErrorHandler(400, "Password cannot be empty");
            };

            if (!req.body.new_password) {
                throw new ErrorHandler(400, "New Password cannot be empty");
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

            // PASSWORD AUTH
            if (user[0].password != GlobalSecurity.hash(req.body.password)) {
                throw new ErrorHandler(401, "INVALID PASSWORD");
            }

            // CHECK AUTH_KEY
            let auth_key = user[0].auth_key;

            if (auth_key != req.body.auth_key) {
                throw new ErrorHandler(401, "INVALID AUTH_KEY");
            }

            let new_password = await user[0].update({
                password: GlobalSecurity.hash(req.body.new_password),
                auth_key: uuidv4()
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            return res.status(200).json({
                auth_key: new_password.auth_key
            });
        } catch (error) {
            next(error)
        }
    });

    app.post("/users/profiles/info/new_number", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================

            // =============================================================


        } catch (error) {
            next(error)
        }
    });


    app.post("/users/profiles/info/new_number/2fa", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================

            // =============================================================


        } catch (error) {
            next(error)
        }
    });

    app.delete("/users/profiles/delete", async (req, res, next) => {
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
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (user.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE USERS");
            }

            // PASSWORD AUTH
            if (user[0].password != GlobalSecurity.hash(req.body.password)) {
                throw new ErrorHandler(401, "INVALID PASSWORD");
            }

            // CHECK AUTH_KEY
            let auth_key = user[0].auth_key;

            if (auth_key != req.body.auth_key) {
                throw new ErrorHandler(401, "INVALID AUTH_KEY");
            }

            let tokens = await user[0].getTokens();
            let usersInfo = await user[0].getUsersInfos({
                where: {
                    userId: user[0].id
                }
            });

            if (tokens.length > 0) {
                let port = app.runningPort
                let originalURL = req.hostname
                for (let i = 0; i < tokens.length; i++) {
                    let provider = await Provider.findAll({
                        where: {
                            id: tokens[i].providerId
                        }
                    }).catch(error => {
                        throw new ErrorHandler(500, error);
                    });

                    // RETURN = [], IF PROVIDER NOT FOUND
                    if (provider.length < 1) {
                        throw new ErrorHandler(401, "INVALD PROVIDER");
                    }

                    // IF PROVIDER IS MORE THAN ONE IN DB
                    if (provider.length > 1) {
                        throw new ErrorHandler(409, "DUPLICATE PROVIDERS");
                    }

                    await axios.post(`${app.is_ssl ? "https://" : "http://"}${originalURL}:${port}/oauth2/${provider[0].name}/Tokens/revoke`, {
                            id: user[0].id,
                            providerId: tokens[i].providerId,
                            platformId: tokens[i].platformId,
                            origin: req.header("Origin")
                        })
                        .then(function (response) {
                            console.log(response.data);
                        })
                        .catch(function (error) {
                            throw new ErrorHandler(500, error);
                        });
                }
            }

            await user[0].destroy().catch(error => {
                throw new ErrorHandler(500, error);
            });;
            await usersInfo[0].destroy().catch(error => {
                throw new ErrorHandler(500, error);
            });;

            return res.status(200).json({
                message: "ACCOUNT SUCCESSFULLY DELETED"
            });
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
}
// =============================================================

module.exports = {
    production,
    development
}