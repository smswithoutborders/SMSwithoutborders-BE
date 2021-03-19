const configs = require("./config.json");
const express = require("express");

var app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.listen(configs.PORT, console.log(`Server is running on port ${configs.PORT}`));