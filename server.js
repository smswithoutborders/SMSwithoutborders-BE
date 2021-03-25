const configs = require("./config.json");
const express = require("express");
const session = require("express-session");
var SequelizeStore = require("connect-session-sequelize")(session.Store);
const swaggerUi = require('swagger-ui-express');
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const swaggerDocument = require('./openapi.json');
const db = require("./models");

var app = express();

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
// require("./routes/auth.routes.js")(app);
require("./routes/routes.js")(app);

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

app.listen(configs.api.API_PORT, console.log(`Server is running on port ${configs.api.API_PORT}`));