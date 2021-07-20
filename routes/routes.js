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

// ==================== GMAIL ====================
const GMAIL = fs.existsSync(__dirname + "/../Providers/Google/Gmail.js") ? require("../Providers/Google/Gmail.js") : false;
const gmail_token_scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

let gmail = !GMAIL ? false : new GMAIL(credentials, gmail_token_scopes);

// ==================== TWITTER ====================
const TWITTER = fs.existsSync(__dirname + "/../Providers/Twitter/Twitter.js") ? require("../Providers/Twitter/Twitter.js") : false;

let twitter = !TWITTER ? false : new TWITTER(credentials);
// =========================================================================================================================

// ==================== PRODUCTION ====================
let production = (app, configs, db) => {
    var User = db.users;
    var Token = db.tokens;
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

            // CHECK AUTH_KEY
            let auth_key = user[0].auth_key;

            if (auth_key != req.body.auth_key) {
                throw new ErrorHandler(401, "INVALID AUTH_KEY");
            };

            switch (true) {
                case provider[0].name == "google":
                    switch (platform[0].name) {
                        case "gmail":
                            let originalURL = req.header("Origin");
                            let result = await gmail.init(originalURL).catch(error => {
                                throw new ErrorHandler(500, error);
                            });

                            return res.status(200).json({
                                auth_key: user[0].auth_key,
                                provider: provider[0].name,
                                platform: platform[0].name,
                                url: result.url
                            });
                        default:
                            throw new ErrorHandler(401, "INVALD PLATFORM");
                    }
                    break;
                case provider[0].name == "twitter":
                    switch (platform[0].name) {
                        case "twitter":
                            let originalURL = req.header("Origin");
                            let result = await twitter.init(originalURL).catch(error => {
                                throw new ErrorHandler(500, error);
                            });

                            return res.status(200).json({
                                auth_key: user[0].auth_key,
                                provider: provider[0].name,
                                platform: platform[0].name,
                                url: result.url
                            });
                        default:
                            throw new ErrorHandler(401, "INVALD PLATFORM");
                    }
                    break;
                default:
                    throw new ErrorHandler(401, "INVALD PROVIDER");
            }
        } catch (error) {
            next(error);
        }
    });

    app.post('/:provider/auth/success', async (req, res, next) => {
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

            if (token.length > 0) {
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

            switch (true) {
                case req.params.provider == "google":
                    switch (platform[0].name) {
                        case "gmail":
                            if (!req.body.code) {
                                throw new ErrorHandler(400, "Code cannot be empty");
                            };

                            let code = req.body.code;

                            let originalURL = req.header("Origin");
                            let result = await gmail.validate(originalURL, code).catch(error => {
                                throw new ErrorHandler(500, error);
                            });;

                            let new_token = await Token.create({
                                profile: security.encrypt(JSON.stringify(result.profile)).e_info,
                                token: security.encrypt(JSON.stringify(result.token)).e_info,
                                email: security.hash(result.profile.data.email),
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

                            return res.status(200).json({
                                auth_key: user[0].auth_key
                            });
                        default:
                            throw new ErrorHandler(401, "INVALD PLATFORM");
                    }
                    break;
                case req.params.provider == "twitter":
                    switch (platform[0].name) {
                        case "twitter":
                            if (!req.body.oauth_token) {
                                throw new ErrorHandler(400, "oauth_token cannot be empty");
                            };
                            if (!req.body.oauth_verifier) {
                                throw new ErrorHandler(400, "oauth_verifier cannot be empty");
                            };

                            let oauth_token = req.body.oauth_token;
                            let oauth_verifier = req.body.oauth_verifier;

                            let originalURL = req.header("Origin");
                            let result = await twitter.validate(originalURL, oauth_token, oauth_verifier).catch(error => {
                                throw new ErrorHandler(500, error);
                            });;

                            let new_token = await Token.create({
                                profile: security.encrypt(JSON.stringify(result.profile)).e_info,
                                token: security.encrypt(JSON.stringify(result.token)).e_info,
                                email: null,
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

                            return res.status(200).json({
                                auth_key: user[0].auth_key
                            });
                        default:
                            throw new ErrorHandler(401, "INVALD PLATFORM");
                    }
                    break;
                default:
                    throw new ErrorHandler(401, "INVALD PROVIDER");
            };
        } catch (error) {
            next(error);
        };
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

            let url = `${configs.router.url}:${configs.router.port}/sms/twilio`;
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

            let url = `${configs.router.url}:${configs.router.port}/sms/twilio/verification_token`;
            let number = usersInfo[0].full_phone_number;
            let code = req.body.code;
            let session_id = req.body.session_id;
            let auth_token = credentials.twilio.AUTH_TOKEN;

            let _2fa_data = await _2fa.verify(url, number, session_id, code, auth_token, next);

            if (_2fa_data) {
                if (_2fa_data.verification_status == "approved") {
                    await usersInfo[0].update({
                        phone_number: security.encrypt(usersInfo[0].phone_number).e_info,
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
                        email: profile.data.email ? profile.data.email : "n/a"
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

            let token = await Token.findAll({
                where: {
                    [Op.and]: [{
                        userId: user[0].id
                    }, {
                        platformId: platform[0].id
                    }, {
                        providerId: provider[0].id
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

            let fetch_tokens = JSON.parse(security.decrypt(token[0].token, token[0].iv));

            switch (true) {
                case provider[0].name == "google":
                    switch (platform[0].name) {
                        case "gmail":
                            let originalURL = req.header("Origin");
                            let result = await gmail.revoke(originalURL, fetch_tokens).catch(error => {
                                throw new ErrorHandler(500, error);
                            });;

                            if (result) {
                                await token[0].destroy().catch(error => {
                                    throw new ErrorHandler(500, error);
                                });;

                                return res.status(200).json({
                                    message: "REVOKE SUCCESSFUL"
                                });
                            };
                        default:
                            throw new ErrorHandler(401, "INVALD PLATFORM");
                    }
                    break;
                case provider[0].name == "twitter":
                    switch (platform[0].name) {
                        case "twitter":
                            let originalURL = req.header("Origin");
                            let result = await twitter.revoke(originalURL, fetch_tokens).catch(error => {
                                throw new ErrorHandler(500, error);
                            });;

                            if (result) {
                                await token[0].destroy().catch(error => {
                                    throw new ErrorHandler(500, error);
                                });;

                                return res.status(200).json({
                                    message: "REVOKE SUCCESSFUL"
                                });
                            };
                        default:
                            throw new ErrorHandler(401, "INVALD PLATFORM");
                    }
                    break;
                default:
                    throw new ErrorHandler(401, "INVALD PROVIDER");
            };
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

            let secondary_numbers = [];

            for (let i = 0; i < usersInfo.length; i++) {
                if (usersInfo[i].role == "secondary" && usersInfo[i].status == "verified") {
                    secondary_numbers.push({
                        country_code: security.decrypt(usersInfo[i].country_code, usersInfo[i].iv),
                        phone_number: usersInfo[i].phone_number
                    });
                }
            }

            let profile_info = {
                id: user[0].id,
                phone_number: security.decrypt(usersInfo[0].phone_number, usersInfo[0].iv),
                country_code: security.decrypt(usersInfo[0].country_code, usersInfo[0].iv),
                phonenumber_hash: usersInfo[0].full_phone_number,
                name: security.decrypt(usersInfo[0].name, usersInfo[0].iv),
                last_login: user[0].updatedAt,
                created: user[0].createdAt,
                secondary_numbers: secondary_numbers
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

            let tokens = await user[0].getTokens();
            let usersInfo = await user[0].getUsersInfos({
                where: {
                    status: "verified"
                }
            });

            let security = new Security(user[0].password)

            let new_password = await user[0].update({
                password: GlobalSecurity.hash(req.body.new_password),
                auth_key: uuidv4()
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            let security_new = new Security(new_password.password)

            for (let j = 0; j < usersInfo.length; j++) {
                let uname = security.decrypt(usersInfo[j].name, usersInfo[j].iv);
                let pn = security.decrypt(usersInfo[j].phone_number, usersInfo[j].iv);
                let cc = security.decrypt(usersInfo[j].country_code, usersInfo[j].iv);

                await usersInfo[j].update({
                    name: security_new.encrypt(uname).e_info,
                    phone_number: security_new.encrypt(pn).e_info,
                    country_code: security_new.encrypt(cc).e_info,
                    iv: security_new.iv
                }).catch(error => {
                    throw new ErrorHandler(500, error);
                });
            };

            for (let j = 0; j < tokens.length; j++) {
                let p = JSON.parse(security.decrypt(tokens[j].profile, tokens[j].iv))
                let t = JSON.parse(security.decrypt(tokens[j].token, tokens[j].iv))

                await tokens[j].update({
                    profile: security_new.encrypt(JSON.stringify(p)).e_info,
                    token: security_new.encrypt(JSON.stringify(t)).e_info,
                    iv: security_new.iv
                }).catch(error => {
                    throw new ErrorHandler(500, error);
                });
            }

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
            if (!req.body.id) {
                throw new ErrorHandler(400, "ID cannot be empty");
            };

            if (!req.body.new_phone_number) {
                throw new ErrorHandler(400, "New phone number cannot be empty");
            };

            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (!req.body.country_code) {
                throw new ErrorHandler(400, "User_country_code cannot be empty");
            };
            // =============================================================

            let usersInfo = await UsersInfo.findAll({
                where: {
                    full_phone_number: GlobalSecurity.hash(req.body.country_code + req.body.new_phone_number),
                    status: "verified"
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (usersInfo.length > 0) {
                throw new ErrorHandler(409, "DUPLICATE USERS");
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
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (user.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE USERS");
            };

            // CHECK AUTH_KEY
            let auth_key = user[0].auth_key;

            if (auth_key != req.body.auth_key) {
                throw new ErrorHandler(401, "INVALID AUTH_KEY");
            }

            let new_usersInfo = await user[0].getUsersInfos({
                where: {
                    role: "primary",
                    status: "verified"
                }
            });

            // RTURN = [], IF USER IS NOT FOUND
            if (new_usersInfo.length < 1) {
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (new_usersInfo.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE USERS");
            };

            let security = new Security(user[0].password);

            let new_number = await UsersInfo.create({
                phone_number: req.body.new_phone_number,
                name: security.decrypt(new_usersInfo[0].name, new_usersInfo[0].iv),
                country_code: req.body.country_code,
                full_phone_number: req.body.country_code + req.body.new_phone_number,
                userId: user[0].id
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            let _2fa = new _2FA();

            let url = `${configs.router.url}:${configs.router.port}/sms/twilio`;
            let number = req.body.country_code + req.body.new_phone_number;
            let auth_token = credentials.twilio.AUTH_TOKEN;

            let _2fa_data = await _2fa.send(url, number, auth_token, next);

            if (_2fa_data) {
                let SV = await SmsVerification.create({
                    userId: user[0].id,
                    session_id: _2fa_data.service_sid,
                }).catch(error => {
                    throw new ErrorHandler(500, error);
                });

                return res.status(200).json({
                    session_id: SV.session_id,
                    svid: SV.svid + ":" + new_number.id
                })
            }
        } catch (error) {
            next(error)
        }
    });

    app.post("/users/profiles/info/new_number/2fa", async (req, res, next) => {
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
            // =============================================================
            let str = req.body.svid.split(":");
            let svid = str[0];
            let uiid = str[1];

            let SV = await SmsVerification.findAll({
                where: {
                    session_id: req.body.session_id,
                    svid: svid
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

            let usersInfo = await user.getUsersInfos({
                where: {
                    id: uiid
                }
            });

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

            let url = `${configs.router.url}:${configs.router.port}/sms/twilio/verification_token`;
            let number = usersInfo[0].full_phone_number;
            let code = req.body.code;
            let session_id = req.body.session_id;
            let auth_token = credentials.twilio.AUTH_TOKEN;

            let _2fa_data = await _2fa.verify(url, number, session_id, code, auth_token, next);

            if (_2fa_data) {
                if (_2fa_data.verification_status == "approved") {
                    await usersInfo[0].update({
                        phone_number: security.encrypt(usersInfo[0].phone_number).e_info,
                        name: security.encrypt(usersInfo[0].name).e_info,
                        country_code: security.encrypt(usersInfo[0].country_code).e_info,
                        full_phone_number: security.hash(usersInfo[0].country_code + usersInfo[0].phone_number),
                        status: "verified",
                        role: "secondary",
                        iv: security.iv
                    }).catch(error => {
                        throw new ErrorHandler(500, error);
                    });

                    return res.status(200).json({
                        message: "NUMBER ADDED SUCCESSFULLY"
                    })
                };

                if (_2fa_data.verification_status == "pending") {
                    return res.status(401).json({
                        message: "INVALID VERIFICATION CODE"
                    })
                }
            }
        } catch (error) {
            next(error)
        }
    });

    app.post("/users/profiles/password/recovery", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.phone_number) {
                throw new ErrorHandler(400, "Phone number cannot be empty");
            };
            // =============================================================

            let usersInfo = await UsersInfo.findAll({
                where: {
                    full_phone_number: GlobalSecurity.hash(req.body.phone_number),
                    status: "verified",
                    role: "primary"
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (usersInfo.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE USERS");
            }

            if (usersInfo.length < 1) {
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            let user = await usersInfo[0].getUser();

            if (!user) {
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            await usersInfo[0].update({
                full_phone_number: req.body.phone_number,
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            let _2fa = new _2FA();

            let url = `${configs.router.url}:${configs.router.port}/sms/twilio`;
            let number = req.body.phone_number;
            let auth_token = credentials.twilio.AUTH_TOKEN;

            let _2fa_data = await _2fa.send(url, number, auth_token, next);

            if (_2fa_data) {
                let SV = await SmsVerification.create({
                    userId: user.id,
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
            next(error)
        }
    });

    app.post("/users/profiles/password/recovery/2fa", async (req, res, next) => {
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
            // =============================================================
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

            let usersInfo = await user.getUsersInfos({
                where: {
                    role: "primary",
                    status: "verified"
                }
            });

            // RTURN = [], IF USER IS NOT FOUND
            if (usersInfo.length < 1) {
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (usersInfo.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE USERS");
            }

            let security = new Security(user.password);

            let _2fa = new _2FA();

            let url = `${configs.router.url}:${configs.router.port}/sms/twilio/verification_token`;
            let number = usersInfo[0].full_phone_number;
            let code = req.body.code;
            let session_id = req.body.session_id;
            let auth_token = credentials.twilio.AUTH_TOKEN;

            let _2fa_data = await _2fa.verify(url, number, session_id, code, auth_token, next);

            if (_2fa_data) {
                if (_2fa_data.verification_status == "approved") {
                    await usersInfo[0].update({
                        full_phone_number: security.hash(usersInfo[0].full_phone_number)
                    }).catch(error => {
                        throw new ErrorHandler(500, error);
                    });

                    await user.update({
                        auth_key: uuidv4()
                    }).catch(error => {
                        throw new ErrorHandler(500, error);
                    });

                    return res.status(200).json({
                        auth_key: user.auth_key
                    })
                };

                if (_2fa_data.verification_status == "pending") {
                    return res.status(401).json({
                        message: "INVALID VERIFICATION CODE"
                    })
                }
            }
        } catch (error) {
            next(error)
        }
    });

    app.post("/users/profiles/password/recovery/new", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.auth_key) {
                throw new ErrorHandler(400, "Auth_key cannot be empty");
            };

            if (req.body.new_password.length < 8) {
                throw new ErrorHandler(400, "New Password is less than 8 characters");
            };

            if (!req.body.new_password) {
                throw new ErrorHandler(400, "New Password cannot be empty");
            };
            // =============================================================

            let user = await User.findAll({
                where: {
                    auth_key: req.body.auth_key
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

            let tokens = await user[0].getTokens();
            let usersInfo = await user[0].getUsersInfos({
                where: {
                    status: "verified"
                }
            });

            if (tokens.length > 0) {
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
                    };

                    let fetch_tokens = JSON.parse(security.decrypt(tokens[i].token, tokens[i].iv));

                    switch (true) {
                        case provider[i].name == "google":
                            switch (platform[i].name) {
                                case "gmail":
                                    let originalURL = req.header("Origin");
                                    let result = await gmail.revoke(originalURL, fetch_tokens).catch(error => {
                                        throw new ErrorHandler(500, error);
                                    });;

                                    if (result) {
                                        await token[i].destroy().catch(error => {
                                            throw new ErrorHandler(500, error);
                                        });;
                                    };
                                default:
                                    throw new ErrorHandler(401, "INVALD PLATFORM");
                            }
                            break;
                        case provider[i].name == "twitter":
                            switch (platform[i].name) {
                                case "twitter":
                                    let originalURL = req.header("Origin");
                                    let result = await twitter.revoke(originalURL, fetch_tokens).catch(error => {
                                        throw new ErrorHandler(500, error);
                                    });;

                                    if (result) {
                                        await token[i].destroy().catch(error => {
                                            throw new ErrorHandler(500, error);
                                        });;

                                        return res.status(200).json({
                                            message: "REVOKE SUCCESSFUL"
                                        });
                                    };
                                default:
                                    throw new ErrorHandler(401, "INVALD PLATFORM");
                            }
                            break;
                        default:
                            throw new ErrorHandler(401, "INVALD PROVIDER");
                    };
                }
            };

            let security = new Security(user[0].password)

            let new_password = await user[0].update({
                password: GlobalSecurity.hash(req.body.new_password),
                auth_key: uuidv4()
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            let security_new = new Security(new_password.password)

            for (let j = 0; j < usersInfo.length; j++) {
                let uname = security.decrypt(usersInfo[j].name, usersInfo[j].iv);
                let pn = security.decrypt(usersInfo[j].phone_number, usersInfo[j].iv);
                let cc = security.decrypt(usersInfo[j].country_code, usersInfo[j].iv);

                await usersInfo[j].update({
                    name: security_new.encrypt(uname).e_info,
                    phone_number: security_new.encrypt(pn).e_info,
                    country_code: security_new.encrypt(cc).e_info,
                    iv: security_new.iv
                }).catch(error => {
                    throw new ErrorHandler(500, error);
                });
            }

            return res.status(200).json({
                auth_key: new_password.auth_key
            });
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
                    status: "verified"
                }
            });

            if (tokens.length > 0) {
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

                    let fetch_tokens = JSON.parse(security.decrypt(tokens[i].token, tokens[i].iv));

                    switch (true) {
                        case provider[i].name == "google":
                            switch (platform[i].name) {
                                case "gmail":
                                    let originalURL = req.header("Origin");
                                    let result = await gmail.revoke(originalURL, fetch_tokens).catch(error => {
                                        throw new ErrorHandler(500, error);
                                    });;

                                    if (result) {
                                        await token[i].destroy().catch(error => {
                                            throw new ErrorHandler(500, error);
                                        });;
                                    };
                                default:
                                    throw new ErrorHandler(401, "INVALD PLATFORM");
                            }
                            break;
                        case provider[i].name == "twitter":
                            switch (platform[i].name) {
                                case "twitter":
                                    let originalURL = req.header("Origin");
                                    let result = await twitter.revoke(originalURL, fetch_tokens).catch(error => {
                                        throw new ErrorHandler(500, error);
                                    });;

                                    if (result) {
                                        await token[i].destroy().catch(error => {
                                            throw new ErrorHandler(500, error);
                                        });;
                                    };
                                default:
                                    throw new ErrorHandler(401, "INVALD PLATFORM");
                            }
                            break;
                        default:
                            throw new ErrorHandler(401, "INVALD PROVIDER");
                    };
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
    var Token = db.tokens;

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

    app.post("/hash", async (req, res, next) => {
        try {
            // ==================== REQUEST BODY CHECKS ====================
            if (!req.body.email) {
                throw new ErrorHandler(400, "Email cannot be empty");
            };
            // =============================================================
            let tokens = await Token.findAll({
                where: {
                    email: GlobalSecurity.hash(req.body.email)
                }
            }).catch(error => {
                throw new ErrorHandler(500, error);
            });

            // RTURN = [], IF USER IS NOT FOUND
            if (tokens.length < 1) {
                throw new ErrorHandler(401, "TOKEN DOESN'T EXIST");
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (tokens.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE TOKENS");
            }

            let user = await tokens[0].getUser();

            if (!user) {
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            let usersInfo = await user.getUsersInfos({
                where: {
                    status: "verified",
                    role: "primary"
                }
            });

            // RTURN = [], IF USER IS NOT FOUND
            if (usersInfo.length < 1) {
                throw new ErrorHandler(401, "USER DOESN'T EXIST");
            }

            // IF MORE THAN ONE USER EXIST IN DATABASE
            if (usersInfo.length > 1) {
                throw new ErrorHandler(409, "DUPLICATE USERS");
            }

            var security = new Security(user.password);
            let userData = [];

            for (let i = 0; i < usersInfo.length; i++) {
                userData.push({
                    country_code: security.decrypt(usersInfo[i].country_code, usersInfo[i].iv),
                    phone_number: security.decrypt(usersInfo[i].phone_number, usersInfo[i].iv)
                });
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