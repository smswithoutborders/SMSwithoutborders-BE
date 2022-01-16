const credentials = require("../../credentials.json");
const ERRORS = require("../../error.js");
const gmail_token_scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

const GMAIL = require("../platforms/GMAIL");

module.exports = async (req, res, next) => {
    try {
        const platform = req.params.platform.toLowerCase();
        const protocol = req.params.protocol.toLowerCase();

        if (platform == "gmail") {

            if (protocol == "oauth2") {
                req.platform = new GMAIL.OAuth2(credentials, gmail_token_scopes);
                return next();
            };

            throw new ERRORS.BadRequest();
        };

        throw new ERRORS.BadRequest();
    } catch (err) {
        if (err instanceof Errors.BadRequest) {
            return res.status(400).send();
        } // 400

        console.log(error);
        return res.status(500).send();
    };
}