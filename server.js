const configs = require("./config.json");
const express = require("express");
const swaggerUi = require('swagger-ui-express');
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
let cookieParser = require('cookie-parser');

var app = express();

const db = require("./schemas");

const API_DOCS_V1 = require("./routes/prod/api-docs-v1.json");
const API_DOCS_V2 = require("./routes/prod/api-docs-v2.json");

const https = require("https")

// https://portswigger.net/web-security/cors/access-control-allow-origin

const whitelist = configs.api.ORIGIN;
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

// ROUTES
require("./routes/prod")(app, configs, db);

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
    console.log("Production [+] Running secured on port:", configs.ssl_api.API_PORT)
    app.runningPort = configs.ssl_api.API_PORT
    app.is_ssl = true
} else {
    console.log("Production [+] Running in-secured on port:", configs.api.API_PORT)
    app.listen(configs.api.API_PORT, console.log(`Prodcution server is running on port ${configs.api.API_PORT}`));
    app.runningPort = configs.api.API_PORT
    app.is_ssl = false
}