var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
const db = require("../models");
var User = db.users;

module.exports = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(async (username, password, done) => {
        let user = await User.findOne({
            where: {
                phone_number: username
            }
        })
        if (!user) {
            const error = new Error("Invalid Phone number");
            error.httpStatusCode = 401;
            return done(error, false);
        }
        if (user.password != password) {
            const error = new Error("Invalid Password");
            error.httpStatusCode = 401;
            return done(error, false);
        }
        return done(null, user);
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        let user = await User.findByPk(id);
        done(null, user)
    });
}