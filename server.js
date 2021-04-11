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

const https = require("https")

var app = express();

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
// require("./controllers/passportAuth.js")(app);
require("./controllers/googleAuth.js")(app);

// DATABASE
db.sequelize.sync({
    alter: true,
    alter: {
        drop: false
    }
});

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
if((configs.hasOwnProperty("ssl_api")) && fs.existsSync(configs.ssl_api.CERTIFICATE) && fs.existsSync(configs.ssl_api.KEY) && fs.existsSync(configs.ssl_api.PEM)){
	let privateKey  = fs.readFileSync(configs.ssl_api.KEY, 'utf8');
	let certificate = fs.readFileSync(configs.ssl_api.CERTIFICATE, 'utf8');
	// let certificate = fs.readFileSync(configs.ssl_api.PEM, 'utf8');
	let ca = [
		fs.readFileSync(configs.ssl_api.PEM)
	]
	let credentials = {key: privateKey, cert: certificate, ca: ca};
	httpsServer = https.createServer(credentials, app);
	httpsServer.listen(configs.ssl_api.API_PORT);
	console.log("[+] Running secured on port:", configs.ssl_api.API_PORT)
	app.runningPort = configs.ssl_api.API_PORT
	app.is_ssl = true
}
else {
	console.log("[+] Running in-secured on port:", configs.api.API_PORT)
	app.listen(configs.api.API_PORT, console.log(`Server is running on port ${configs.api.API_PORT}`));
	app.runningPort = configs.api.API_PORT
	app.is_ssl = false
}

