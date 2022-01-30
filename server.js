const config = require('config');
const SERVER_CFG = config.get("SERVER");
const ORIGIN = SERVER_CFG.origin;

const express = require("express");
const swaggerUi = require('swagger-ui-express');
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
let cookieParser = require('cookie-parser');

var app = express();

const API_DOCS_V1 = require("./routes/prod/api-docs-v1.json");
const API_DOCS_V2 = require("./routes/prod/api-docs-v2.json");

const https = require("https")

// https://portswigger.net/web-security/cors/access-control-allow-origin

const whitelist = ORIGIN;
app.use(cors({
    origin: whitelist,
    credentials: true,
}));

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use('/public', express.static(path.join(__dirname, 'logos')));

// Create swagger docs
var options = {}
app.use('/v1/api-docs', swaggerUi.serveFiles(API_DOCS_V1, options), swaggerUi.setup(API_DOCS_V1));
app.use('/v2/api-docs', swaggerUi.serveFiles(API_DOCS_V2, options), swaggerUi.setup(API_DOCS_V2));

// logger
var successLogStream = fs.createWriteStream(path.join(__dirname, "logs/success.log"), {
    flags: 'a'
})
var errorLogStream = fs.createWriteStream(path.join(__dirname, "logs/error.log"), {
    flags: 'a'
});

// setup the logger middleware
if (config.util.getEnv('NODE_ENV') !== 'test') {
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

    if (config.util.getEnv('NODE_ENV') !== 'production') {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined'));
    }
};

// ROUTES
require("./routes/prod")(app);

var httpsServer = ""
if ((SERVER_CFG.hasOwnProperty("ssl_api")) && fs.existsSync(SERVER_CFG.ssl_api.CERTIFICATE) && fs.existsSync(SERVER_CFG.ssl_api.KEY) && fs.existsSync(SERVER_CFG.ssl_api.PEM)) {
    let privateKey = fs.readFileSync(SERVER_CFG.ssl_api.KEY, 'utf8');
    let certificate = fs.readFileSync(SERVER_CFG.ssl_api.CERTIFICATE, 'utf8');
    // let certificate = fs.readFileSync(SERVER_CFG.ssl_api.PEM, 'utf8');
    let ca = [
        fs.readFileSync(SERVER_CFG.ssl_api.PEM)
    ]
    let credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };
    httpsServer = https.createServer(credentials, app);
    httpsServer.listen(SERVER_CFG.ssl_api.API_PORT);
    console.log("Production [+] Running secured on port:", SERVER_CFG.ssl_api.API_PORT)
    app.runningPort = SERVER_CFG.ssl_api.API_PORT
    app.is_ssl = true
} else {
    console.log("Production [+] Running in-secured on port:", SERVER_CFG.api.API_PORT)
    app.listen(SERVER_CFG.api.API_PORT, console.log(`Prodcution server is running on port ${SERVER_CFG.api.API_PORT}`));
    app.runningPort = SERVER_CFG.api.API_PORT
    app.is_ssl = false
}