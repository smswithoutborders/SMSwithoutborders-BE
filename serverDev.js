const configs = require("./config.json");
const express = require("express");
const session = require("express-session");
var SequelizeStore = require("connect-session-sequelize")(session.Store);
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const chalk = require("chalk");
const {
    handleError,
    ErrorHandler
} = require("./controllers/error.js");
const camelCase = require('camelcase');

const db = require("./models");
var Provider = db.providers;
var Platform = db.platforms;

var app = express();

// var corsOptionsDelegate = (req, callback) => {
//     var validIp = ipaddr.isValid(req.ip);
//     var address = ipaddr.process(req.ip);

//     if (req.ip == "127.0.0.1") {
//         corsOptions = {
//             origin: true
//         }

//         console.log("Valid IP: ", validIp);
//         console.log(address.kind());
//         console.log(req.ip);

//         return callback(null, corsOptions)
//     };

//     corsOptions = {
//         origin: false
//     }
//     console.log("Valid IP: ", validIp);
//     console.log(address.kind());
//     console.log(req.ip + " blocked");
//     const error = new ErrorHandler(403, "Forbidden");
//     return callback(error.message, corsOptions);
// }

// app.use(cors(corsOptionsDelegate));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// app.use(session({
//     secret: configs.api.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     store: new SequelizeStore({
//         db: db.sequelize,
//     }),
//     cookie: {
//         secure: false
//     }
// }));

// app.use(express.static('public'));

// Create swagger docs
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// logger
var successLogStream = fs.createWriteStream(path.join(__dirname, "logs/success.log"), {
    flags: 'a'
})
var errorLogStream = fs.createWriteStream(path.join(__dirname, "logs/error.log"), {
    flags: 'a'
});

// setup the logger middleware
app.use([morgan('combined', {
        skip: function (req, res) {
            return (res.statusCode <= 599 && res.statusCode >= 400)
        },
        stream: successLogStream
    }),
    morgan('combined', {
        skip: function (req, res) {
            return (res.statusCode <= 399 && res.statusCode >= 100)
        },
        stream: errorLogStream
    })

]);

app.use(morgan('dev'));

// DATABASE
(async () => {
    try {
        await db.sequelize.sync({
            alter: true,
            alter: {
                drop: false
            }
        });

        if (fs.existsSync(__dirname + '/Providers')) {
            fs.readdir(__dirname + '/Providers', function (err, providers) {
                //handling error
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }

                if (providers.length < 1) {
                    let warning = chalk.keyword('orange')
                    console.log(warning("WARNING: No providers found, use SWOB-CLI to create a provider"));
                    console.log(warning("Follow the link below to setup SWOB-CLI:"));
                    console.log(chalk.blue("https://github.com/smswithoutborders/SMSwithoutborders_Dev_Tools/tree/master/SWOB_API_Tools/SWOB-CLI"));
                }

                console.log(chalk.blue("Available Providers:"));
                //listing all files using forEach
                providers.forEach(async function (provider) {
                    let data = fs.readFileSync(`${process.cwd()}/Providers/${camelCase(provider, {pascalCase: true})}/info.json`, 'utf8');
                    let info = JSON.parse(data);

                    let new_db_providers = {};
                    let db_providers = await Provider.findAll({
                        where: {
                            name: info.name.toLowerCase()
                        }
                    }).catch(error => {
                        throw new ErrorHandler(500, error);
                    });;

                    if (db_providers.length > 1) {
                        throw new ErrorHandler(409, "duplicate Providers");
                    }
                    if (db_providers.length < 1) {
                        new_db_providers = await Provider.create({
                            name: info.name.toLowerCase(),
                            description: info.description,
                            letter: info.name.toLowerCase()[0]
                        }).catch(error => {
                            throw new ErrorHandler(500, error);
                        });
                    }
                    for (let i = 0; i < info.platforms.length; i++) {
                        let db_platforms = await Platform.findAll({
                            where: {
                                name: info.platforms[i].name.toLowerCase()
                            }
                        }).catch(error => {
                            throw new ErrorHandler(500, error);
                        });;

                        if (db_platforms.length > 1) {
                            throw new ErrorHandler(409, "duplicate Platforms");
                        }
                        if (db_platforms.length < 1) {
                            await Platform.create({
                                name: info.platforms[i].name.toLowerCase(),
                                type: info.platforms[i].type.toLowerCase(),
                                letter: info.platforms[i].name.toLowerCase()[0],
                                providerId: db_providers < 1 ? new_db_providers.id : db_providers[0].id
                            }).catch(error => {
                                throw new ErrorHandler(500, error);
                            });
                        }
                        console.log(chalk.blue(`${info.name} ----> ${info.platforms[i].name.toLowerCase()}`));
                    };
                });
            });
        } else {
            let warning = chalk.keyword('orange')
            console.log(warning("WARNING: No providers found, use SWOB-CLI to create a provider"));
            console.log(warning("Follow the link below to setup SWOB-CLI:"));
            console.log(chalk.blue("https://github.com/smswithoutborders/SMSwithoutborders_Dev_Tools/tree/master/SWOB_API_Tools/SWOB-CLI"));
        }
    } catch (error) {
        console.error(error)
    }
})();

// ROUTES
require("./routes/dev")(app, configs, db);

// error handler
let errorHandler = (err, req, res, next) => {
    if (err.statusCode) {
        return handleError(err, res);
    };

    console.error(err)
}

app.use(errorHandler);

// console.log("Development [+] Running in-secured on port:", configs.api.DEV_API_PORT)
app.listen(configs.api.DEV_API_PORT, "127.0.0.1", 511, () => {
    console.log(`Development server is running on port ${configs.api.DEV_API_PORT}`)
});
app.runningPort = configs.api.DEV_API_PORT