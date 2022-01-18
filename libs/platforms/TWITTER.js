const twitter = require('oauth');

class OAuth {
    constructor(credentials) {
        this.credentials = credentials;
        this.oauthClientToken = {};
        this.requestTokenSecret = '';
    }

    init(originalURL) {
        return new Promise((resolve, reject) => {
            try {
                this.oauthClientToken = new twitter.OAuth(
                    'https://api.twitter.com/oauth/request_token',
                    'https://api.twitter.com/oauth/access_token',
                    this.credentials.twitter.TWITTER_CLIENT_ID,
                    this.credentials.twitter.TWITTER_CLIENT_SECRET,
                    '1.0A',
                    `${originalURL}/dashboard/oauth2/twitter/Tokens/redirect/`,
                    'HMAC-SHA1'
                );

                this.oauthClientToken.getOAuthRequestToken((error, reqToken, reqTokenSecret) => {
                    if (error) {
                        return console.log(error)
                    };

                    this.requestTokenSecret = reqTokenSecret;

                    const token_url = `https://twitter.com/oauth/authorize?oauth_token=${reqToken}`;

                    resolve({
                        url: token_url
                    })
                });
            } catch (error) {
                reject(error)
            }
        });
    };

    validate(originalURL, ...args) {
        return new Promise((resolve, reject) => {
            try {
                const oauth_token = args[0];
                const oauth_verifier = args[1];

                this.oauthClientToken = new twitter.OAuth(
                    'https://api.twitter.com/oauth/request_token',
                    'https://api.twitter.com/oauth/access_token',
                    this.credentials.twitter.TWITTER_CLIENT_ID,
                    this.credentials.twitter.TWITTER_CLIENT_SECRET,
                    '1.0A',
                    `${originalURL}/dashboard/oauth2/twitter/Tokens/redirect/`,
                    'HMAC-SHA1'
                );

                this.oauthClientToken.getOAuthAccessToken(oauth_token, this.requestTokenSecret, oauth_verifier, (error, accToken, accTokenSecret) => {
                    if (error) {
                        reject(error)
                    };

                    this.oauthClientToken.get("https://api.twitter.com/1.1/account/verify_credentials.json", accToken, accTokenSecret, (e, data, respond) => {
                        if (e) reject(e);
                        let profile = JSON.parse(data);

                        resolve({
                            token: {
                                accToken,
                                accTokenSecret
                            },
                            profile: profile
                        });
                    });
                });
            } catch (error) {
                reject(error)
            }
        });
    };

    revoke(originalURL, token) {
        return new Promise((resolve, reject) => {
            try {
                this.oauthClientToken = new twitter.OAuth(
                    'https://api.twitter.com/oauth/request_token',
                    'https://api.twitter.com/oauth/access_token',
                    this.credentials.twitter.TWITTER_CLIENT_ID,
                    this.credentials.twitter.TWITTER_CLIENT_SECRET,
                    '1.0A',
                    `${originalURL}/dashboard/oauth2/twitter/Tokens/redirect/`,
                    'HMAC-SHA1'
                );

                this.oauthClientToken.post("https://api.twitter.com/1.1/oauth/invalidate_token", token.accToken, token.accTokenSecret, {}, "applicatoin/json", (e, data, respond) => {
                    if (e) reject(e);
                    resolve(true);
                })
            } catch (error) {
                reject(error)
            }
        });
    }
};

module.exports = {
    OAuth
}