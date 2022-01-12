module.exports = (app, configs, db) => {
    require("./v1")(app, configs, db);
    require("./v2")(app, configs, db);
}