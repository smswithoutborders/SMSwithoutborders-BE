const configs = require("./config.json");
const express = require("express");
const db = require("./models");

var app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// DATABASE
db.sequelize.sync();

app.listen(configs.PORT, console.log(`Server is running on port ${configs.PORT}`));