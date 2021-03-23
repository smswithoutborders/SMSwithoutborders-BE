var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    GoogleStrategy = require('passport-google-oauth2').Strategy;
const credentials = require("../credentials.json");
const db = require("../models");
var User = db.users;
var Oauth2 = db.oauth2;

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

    if (credentials.google.GOOGLE_CLIENT_ID && credentials.google.GOOGLE_CLIENT_SECRET) {
        passport.use(new GoogleStrategy({
                clientID: credentials.google.GOOGLE_CLIENT_ID,
                clientSecret: credentials.google.GOOGLE_CLIENT_SECRET,
                callbackURL: "http://localhost:3000/oauth2/google/Tokens/redirect/",
                passReqToCallback: true
            },
            async function (req, accessToken, refreshToken, profile, done) {
                let user = await User.findOne({
                    where: {
                        id: req.user.data.id
                    }
                });
                // search for existing token
                let token = await Oauth2.findOne({
                    where: {
                        profileId: profile.id
                    }
                });

                if (token) {
                    const error = new Error("Token already exist");
                    error.httpStatusCode = 400;
                    return done(error, false);
                };

                newToken = await Oauth2.create({
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    profile: profile,
                    profileId: profile.id
                });

                await user.setOauth2s(newToken);
                return done(null, user);
            }
        ));
    };

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