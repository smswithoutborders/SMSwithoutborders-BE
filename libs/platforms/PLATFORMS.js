const credentials = require("../../credentials.json");
const ERRORS = require("../../error.js");
const gmail_token_scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

const GMAIL = require("../platforms/GMAIL");
const TWITTER = require("../platforms/TWITTER");

module.exports = async (req, res, next) => {
    try {
        const originalURL = req.header("Origin");
        const platform = req.params.platform.toLowerCase();
        const protocol = req.params.protocol.toLowerCase();
        // INFO - Google API returns a UTF-8 encoded verification code on second request of OAuth2 token
        // INFO - Google API Client requires a non UTF-8 verification code, so we decode every verification code entry at API level  
        // TODO Try checking double attempt to store tokens from the diff in auth_code
        const AUTH_CODE = decodeURIComponent(req.body.auth_code);
        const AUTH_TOKEN = req.body.auth_token;
        const AUTH_VERIFIER = req.body.auth_verifier;

        if (platform == "gmail") {

            if (protocol == "oauth2") {
                let platformObj = new GMAIL.OAuth2(credentials, gmail_token_scopes);

                if (req.method.toLowerCase() == "post") {
                    let url = await platformObj.init(originalURL);
                    req.platformRes = {
                        url: url
                    }
                    return next();
                }

                if (req.method.toLowerCase() == "put") {
                    let result = await platformObj.validate(originalURL, AUTH_CODE);
                    req.platformRes = {
                        result: result
                    };
                    return next();
                };

                throw new ERRORS.BadRequest();
            };

            throw new ERRORS.BadRequest();
        };

        if (platform == "twitter") {

            if (protocol == "oauth") {
                let platformObj = new TWITTER.OAuth(credentials);

                if (req.method.toLowerCase() == "post") {
                    let url = await platformObj.init(originalURL);
                    req.platformRes.url = url
                    return next();
                }

                if (req.method.toLowerCase() == "put") {
                    let result = await platformObj.validate(originalURL, AUTH_TOKEN, AUTH_VERIFIER);
                    req.platformRes.result = result;
                    return next();
                };

                throw new ERRORS.BadRequest();
            };

            throw new ERRORS.BadRequest();
        };

        throw new ERRORS.BadRequest();
    } catch (err) {
        if (err instanceof ERRORS.BadRequest) {
            return res.status(400).send(err.message);
        } // 400

        console.log(err);
        return res.status(500).send("internal server error");
    };
}