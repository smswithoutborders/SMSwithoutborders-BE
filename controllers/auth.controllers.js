var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    GoogleStrategy = require('passport-google-oauth2').Strategy;
const configs = require("../config.json");

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

    passport.use(new GoogleStrategy({
            clientID: configs.GOOGLE_CLIENT_ID,
            clientSecret: configs.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://yourdomain:3000/auth/google/callback",
            passReqToCallback: true
        },
        function (request, accessToken, refreshToken, profile, done) {
            User.findOrCreate({
                googleId: profile.id
            }, function (err, user) {
                return done(err, user);
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        let user = await User.findByPk(id);
        let token = await user.getOauth2s();
        let userData = {
            data: user,
            token
        }
        done(null, userData)
    });
}