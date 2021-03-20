const configs = require("./config.json");
const express = require("express");
const session = require("express-session");
var SequelizeStore = require("connect-session-sequelize")(session.Store);
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('./openapi.json');
const db = require("./models");

var app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(session({
    secret: configs.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
        db: db.sequelize,
    }),
    cookie: {
        secure: false
    }
}));

// Create swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Auth tih passport
require("./controllers/auth.controllers.js")(app)

// DATABASE
db.sequelize.sync();

// ROUTES
require("./routes/auth.routes.js")(app);
require("./routes/users.routes.js")(app);

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

app.listen(configs.PORT, console.log(`Server is running on port ${configs.PORT}`));