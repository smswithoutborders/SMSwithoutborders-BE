var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
const db = require("../models");
var User = db.users;

module.exports = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(
        function (username, password, done) {
            User.findOne({
                where: {
                    phone_number: username
                }
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Incorrect phone number.'
                    });
                }
                if (user.password != password) {
                    return done(null, false, {
                        message: 'Incorrect password.'
                    });
                }
                return done(null, user);
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findByPk(id, function (err, user) {
            done(err, user);
        });
    });
}