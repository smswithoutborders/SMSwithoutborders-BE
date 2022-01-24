const configs = require("./config.json");
const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const {
    handleError,
    ErrorHandler
} = require("./controllers/error.js");

const db = require("./schemas");

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
require("./routes/dev")(app, configs, db);

// error handler
let errorHandler = (err, req, res, next) => {
    if (err.statusCode) {
        return handleError(err, res);
    };

    console.error(err)
}

app.use(errorHandler);

app.listen(configs.api.DEV_API_PORT, "127.0.0.1", 511, () => {
    console.log(`Development server is running on port ${configs.api.DEV_API_PORT}`)
});
app.runningPort = configs.api.DEV_API_PORT