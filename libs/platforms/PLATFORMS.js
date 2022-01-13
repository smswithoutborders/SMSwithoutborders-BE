const credentials = require("../../credentials.json");
const gmail_token_scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

const GMAIL = require("../platforms/GMAIL");

module.exports = async (req, res, next) => {
    try {
        if (req.params.platform.toLowerCase() == "gmail") {

            if (req.params.protocol.toLowerCase() == "oauth2") {
                req.platform = new GMAIL.OAuth_2_0(credentials, gmail_token_scopes);
                return next();
            };

            throw new Error("INVALID PROTOCOL")
        };

        throw new Error("INVALID PLATFORM")
    } catch (err) {
        next(err)
    };
}