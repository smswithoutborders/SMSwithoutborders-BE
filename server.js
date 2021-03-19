const configs = require("./config.json");
const express = require("express");
const session = require("express-session");
var SequelizeStore = require("connect-session-sequelize")(session.Store);
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
}))

// Auth tih passport
require("./controllers/auth.controllers.js")(app)

// DATABASE
db.sequelize.sync();

// ROUTES
require("./routes/auth.routes.js")(app);
require("./routes/users.routes.js")(app);

app.listen(configs.PORT, console.log(`Server is running on port ${configs.PORT}`));