const {
    google
} = require('googleapis');
const credentials = require("../credentials.json");
const db = require("../models");
var Oauth2 = db.oauth2;


module.exports = (app) => {
    const oauth2Client = new google.auth.OAuth2(
        credentials.google.GOOGLE_CLIENT_ID,
        credentials.google.GOOGLE_CLIENT_SECRET,
        "http://localhost:3000/oauth2/google/Tokens/redirect/"
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

    app.get('/oauth2/google/Tokens/', (req, res, next) => {
        res.redirect(url);
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
            return done(error, false);
        }

        await Oauth2.create({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiry_date: tokens.expiry_date,
            scope: tokens.scope.split(" "),
            profile: profile,
            profileId: profile.data.id
        });

        // await user.setOauth2s(newToken);
        res.redirect("/profile");
    });
}