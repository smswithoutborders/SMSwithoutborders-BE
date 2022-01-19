const credentials = require("../credentials.json");

let inquirer = require('inquirer');
const FIND_USERS = require("../models/find_users.models");
const FIND_PLATFORMS = require("../models/find_platforms.models");
const FIND_TOKENS = require("../models/find_tokens.models");
const DECRYPT_TOKENS = require("../models/decrypt_tokens.models");

const {
    google
} = require('googleapis');
const twitter = require('oauth');

inquirer
    .prompt([{
            name: 'id',
            message: 'Enter user_id here',
            type: 'input'
        },
        {
            name: 'auth_key',
            message: 'Enter auth_key here',
            type: 'input'
        },
        {
            name: 'platform',
            message: 'Enter platform_name here',
            type: 'input'
        }
    ])
    .then(async (answers) => {
        let user = await FIND_USERS(answers.id, answers.auth_key);
        let platform = await FIND_PLATFORMS(answers.platform);

        if (answers.platform.toLowerCase() == "gmail") {
            let token = await FIND_TOKENS(user, platform);
            let decrypted_token = await DECRYPT_TOKENS(token, user);

            console.log(decrypted_token);

            let CLIENT_ID = credentials.google.GOOGLE_CLIENT_ID;
            let CLIENT_SECRET = credentials.google.GOOGLE_CLIENT_SECRET;
            let REDIRECT_URL = "http://localhost:9000/platforms/google/protocols/oauth2/redirect_codes/";

            const oauth2Client = new google.auth.OAuth2(
                CLIENT_ID,
                CLIENT_SECRET,
                REDIRECT_URL
            );

            oauth2Client.setCredentials(decrypted_token.token);

            let gmail = google.oauth2({
                auth: oauth2Client,
                version: 'v2'
            });

            let profile = await gmail.userinfo.get();

            return console.log(profile);
        } else if (answers.platform.toLowerCase() == "twitter") {
            let token = await FIND_TOKENS(user, platform);
            let decrypted_token = await DECRYPT_TOKENS(token, user);

            console.log(decrypted_token);

            let consumer_key = credentials.twitter.TWITTER_CLIENT_ID;
            let consumer_secret = credentials.twitter.TWITTER_CLIENT_SECRET;

            let oauth = new twitter.OAuth(
                'https://api.twitter.com/oauth/request_token',
                'https://api.twitter.com/oauth/access_token',
                consumer_key,
                consumer_secret,
                '1.0A',
                "http://localhost:9000/platforms/twitter/protocols/oauth/redirect_codes/",
                'HMAC-SHA1'
            );

            oauth.get("https://api.twitter.com/1.1/account/verify_credentials.json", decrypted_token.token.accessToken, decrypted_token.token.accessTokenSecret, (e, data, respond) => {
                if (e) console.error(e);
                return console.log(data);
            });
        } else {
            return console.log("Not Found")
        };
    })
    .catch((error) => {
        if (error.isTtyError) {
            console.log(error)
        } else {
            console.log(error)
        }
    });