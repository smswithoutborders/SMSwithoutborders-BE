const configs = require("./config.json");
const express = require("express");
const session = require("express-session");
var SequelizeStore = require("connect-session-sequelize")(session.Store);
const swaggerUi = require('swagger-ui-express');
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const swaggerDocument = require('./openapi.json');
const db = require("./models");
var Provider = db.providers;
var Platform = db.platforms;

const https = require("https")

var app = express();

var whitelist = configs.origin

var corsOptionsDelegate = (req, callback) => {
    // console.log(req.hostname)
    var corsOptions;
    if (whitelist.indexOf(req.connection.remoteAddress) !== -1) {
        corsOptions = {
            origin: true
        }
        console.log(req.connection.remoteAddress)
        return callback(null, corsOptions)
    } else {
        const error = new Error("Forbidden");
        error.httpStatusCode = 403;
        corsOptions = {
            origin: false
        }
        console.log(req.connection.remoteAddress + " blocked")
        return callback(error, corsOptions);
    }
}

app.use(cors(corsOptionsDelegate));

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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

])

// Auths
require("./controllers/googleAuth.js")(app);

// DATABASE
(async () => {
    await db.sequelize.sync({
        alter: true,
        alter: {
            drop: false
        }
    });

    // create default providers and platforms
    let providers = await Provider.findAll();
    let platforms = await Platform.findAll();

    if (providers.length < 1) {
        // Create default providers
        await Provider.bulkCreate([{
            name: "google"
        }, {
            name: "twitter"
        }])
    };

    if (platforms.length < 1) {
        let defaultGoogle = await Provider.findAll({
            where: {
                name: "google"
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        let defaultTwitter = await Provider.findAll({
            where: {
                name: "twitter"
            }
        }).catch(error => {
            error.httpStatusCode = 500
            return next(error);
        });

        if (defaultGoogle.length > 1 || defaultTwitter.length > 1) {
            const error = new Error("duplicate Providers");
            error.httpStatusCode = 409;
            return next(error);
        }

        // Create default providers
        await Platform.bulkCreate([{
                name: "gmail",
                providerId: defaultGoogle[0].id
            },
            {
                name: "twitter",
                providerId: defaultTwitter[0].id
            }
        ])
    };
})();

// ROUTES
require("./routes/routes.js")(app);

// error handler
let errorHandler = (err, req, res, next) => {
    if (err.httpStatusCode === 500) {
        console.error(err.httpStatusCode, err.stack);
        return res.status(err.httpStatusCode).json({
            error: "Something Broke!"
        })
    }

    res.status(err.httpStatusCode).json({
        error: err.message
    });
}

app.use(errorHandler);

var httpsServer = ""
if ((configs.hasOwnProperty("ssl_api")) && fs.existsSync(configs.ssl_api.CERTIFICATE) && fs.existsSync(configs.ssl_api.KEY) && fs.existsSync(configs.ssl_api.PEM)) {
    let privateKey = fs.readFileSync(configs.ssl_api.KEY, 'utf8');
    let certificate = fs.readFileSync(configs.ssl_api.CERTIFICATE, 'utf8');
    // let certificate = fs.readFileSync(configs.ssl_api.PEM, 'utf8');
    let ca = [
        fs.readFileSync(configs.ssl_api.PEM)
    ]
    let credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };
    httpsServer = https.createServer(credentials, app);
    httpsServer.listen(configs.ssl_api.API_PORT);
    console.log("[+] Running secured on port:", configs.ssl_api.API_PORT)
    app.runningPort = configs.ssl_api.API_PORT
    app.is_ssl = true
} else {
    console.log("[+] Running in-secured on port:", configs.api.API_PORT)
    app.listen(configs.api.API_PORT, console.log(`Server is running on port ${configs.api.API_PORT}`));
    app.runningPort = configs.api.API_PORT
    app.is_ssl = false
}