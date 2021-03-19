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
            return done(null, false);
        }
        if (user.password != password) {
            return done(null, false);
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