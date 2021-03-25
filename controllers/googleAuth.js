const {
    google
} = require('googleapis');
const credentials = require("../credentials.json");
const db = require("../models");
var Oauth2 = db.oauth2;
var User = db.users;
const open = require('open');
let iden = {};


module.exports = (app) => {
    const oauth2Client = new google.auth.OAuth2(
        credentials.google.GOOGLE_CLIENT_ID,
        credentials.google.GOOGLE_CLIENT_SECRET,
        credentials.google.GOOGLE_CALLBACK_URL
    );

    // generate a url that asks permissions for Blogger and Google Calendar scopes
    const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const url = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',

        // If you only need one scope you can pass it as a string
        scope: scopes
    });

    app.get('/oauth2/google/Tokens/', async (req, res, next) => {
        iden.id = req.query.iden;
        // Opens the URL in the default browser.
        await open(url);
    });

    app.get('/oauth2/google/Tokens/redirect', async (req, res, next) => {
        let code = req.query.code
        const {
            tokens
        } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens);

        // get profile data
        var gmail = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });

        let profile = await gmail.userinfo.get();

        let oauth2 = await Oauth2.findOne({
            where: {
                profileId: profile.data.id
            }
        });

        if (oauth2) {
            const error = new Error("Token already exist");
            error.httpStatusCode = 400;
            return next(error);
        }

        let userId = iden.id;

        let user = await User.findOne({
            where: {
                id: userId
            }
        });

        if (!user) {
            const error = new Error("Invalid user");
            error.httpStatusCode = 401;
            return next(error);
        }

        let newToken = await Oauth2.create({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiry_date: tokens.expiry_date,
            scope: tokens.scope.split(" "),
            profile: profile,
            profileId: profile.data.id
        });

        await user.setOauth2s(newToken);
        return res.redirect("/users/auth/success");
    });

    app.get('/users/auth/success', async (req, res, next) => {
        return res.status(200).json({
            message: "Token stored Login!"
        })
    });
}