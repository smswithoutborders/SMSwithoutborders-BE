const Factory = require("../../factory.js");

var OAuth = require('oauth');

module.exports =

    class Twitter extends Factory {
        constructor(credentials) {
            super();
            this.credentials = credentials;
            this.oauth2ClientToken = {};
            this.requestTokenSecret = '';
        }

        init(originalURL) {
            return new Promise((resolve, reject) => {
                try {
                    this.oauth2ClientToken = new OAuth.OAuth(
                        'https://api.twitter.com/oauth/request_token',
                        'https://api.twitter.com/oauth/access_token',
                        this.credentials.twitter.TWITTER_CLIENT_ID,
                        this.credentials.twitter.TWITTER_CLIENT_SECRET,
                        '1.0A',
                        `${originalURL}/dashboard/oauth2/twitter/Tokens/redirect/`,
                        'HMAC-SHA1'
                    );

                    this.oauth2ClientToken.getOAuthRequestToken((error, reqToken, reqTokenSecret) => {
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

        validate(originalURL, oauth_token, oauth_verifier) {
            return new Promise((resolve, reject) => {
                try {
                    this.oauth2ClientToken = new OAuth.OAuth(
                        'https://api.twitter.com/oauth/request_token',
                        'https://api.twitter.com/oauth/access_token',
                        this.credentials.twitter.TWITTER_CLIENT_ID,
                        this.credentials.twitter.TWITTER_CLIENT_SECRET,
                        '1.0A',
                        `${originalURL}/dashboard/oauth2/twitter/Tokens/redirect/`,
                        'HMAC-SHA1'
                    );

                    this.oauth2ClientToken.getOAuthAccessToken(oauth_token, this.requestTokenSecret, oauth_verifier, (error, accToken, accTokenSecret) => {
                        if (error) {
                            reject(error)
                        };

                        this.oauth2ClientToken.get("https://api.twitter.com/1.1/account/verify_credentials.json", accToken, accTokenSecret, (e, data, respond) => {
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
                    this.oauth2ClientToken = new OAuth.OAuth(
                        'https://api.twitter.com/oauth/request_token',
                        'https://api.twitter.com/oauth/access_token',
                        this.credentials.twitter.TWITTER_CLIENT_ID,
                        this.credentials.twitter.TWITTER_CLIENT_SECRET,
                        '1.0A',
                        `${originalURL}/dashboard/oauth2/twitter/Tokens/redirect/`,
                        'HMAC-SHA1'
                    );

                    this.oauth2ClientToken.post("https://api.twitter.com/1.1/oauth/invalidate_token", token.accToken, token.accTokenSecret, {}, "applicatoin/json", (e, data, respond) => {
                        if (e) reject(e);
                        resolve(true);
                    })
                } catch (error) {
                    reject(error)
                }
            });
        }
    }