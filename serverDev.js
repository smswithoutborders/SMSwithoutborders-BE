const config = require('config');
const SERVER_CFG = config.get("SERVER");
const ORIGIN = SERVER_CFG.origin;

const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

var app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// app.use(express.static('public'));

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
require("./routes/dev")(app);

app.listen(SERVER_CFG.api.DEV_API_PORT, "127.0.0.1", 511, () => {
    console.log(`Development server is running on port ${SERVER_CFG.api.DEV_API_PORT}`)
});
app.runningPort = SERVER_CFG.api.DEV_API_PORT