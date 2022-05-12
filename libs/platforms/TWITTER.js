const {
    TwitterApi
} = require('twitter-api-v2');

class OAuth2 {
    constructor(credentials, token_scopes) {
        this.credentials = credentials;
        this.oauthClientToken = {};
        this.token_scopes = token_scopes;
    }

    init(originalURL) {
        return new Promise(async (resolve, reject) => {
            try {
                this.oauthClientToken = new TwitterApi({
                    clientId: this.credentials.twitter.TWITTER_CLIENT_ID,
                    clientSecret: this.credentials.twitter.TWITTER_CLIENT_SECRET
                });

                const {
                    url,
                    codeVerifier
                } = this.oauthClientToken.generateOAuth2AuthLink(`${originalURL}/platforms/twitter/protocols/oauth2/redirect_codes/`, {
                    scope: this.token_scopes
                });

                resolve({
                    codeVerifier,
                    url
                });
            } catch (error) {
                reject(error)
            }
        });
    };

    validate(originalURL, ...args) {
        return new Promise(async (resolve, reject) => {
            try {
                const code = args[0];
                const codeVerifier = args[1]

                this.oauthClientToken = new TwitterApi({
                    clientId: this.credentials.twitter.TWITTER_CLIENT_ID,
                    clientSecret: this.credentials.twitter.TWITTER_CLIENT_SECRET
                });

                let tokens = await this.oauthClientToken.loginWithOAuth2({
                    code: code,
                    codeVerifier: codeVerifier,
                    redirectUri: `${originalURL}/platforms/twitter/protocols/oauth2/redirect_codes/`
                });

                let partial_client = new TwitterApi(tokens.accessToken);
                let profile = await partial_client.currentUserV2();

                resolve({
                    profile: profile,
                    token: {
                        token_type: "bearer",
                        expires_in: tokens.expiresIn,
                        access_token: tokens.accessToken,
                        scope: tokens.scope,
                        refresh_token: tokens.refreshToken,
                    }
                })
            } catch (error) {
                reject(error)
            }
        });
    };

    revoke(token) {
        return new Promise(async (resolve, reject) => {
            try {
                this.oauthClientToken = new TwitterApi({
                    clientId: this.credentials.twitter.TWITTER_CLIENT_ID,
                    clientSecret: this.credentials.twitter.TWITTER_CLIENT_SECRET
                });

                let Token = await this.refresh(token);
                await this.oauthClientToken.revokeOAuth2Token(Token.access_token, "access_token")

                resolve(true);
            } catch (error) {
                reject(error)
            }
        });
    }

    refresh(token) {
        return new Promise(async (resolve, reject) => {
            try {
                this.oauthClientToken = new TwitterApi({
                    clientId: this.credentials.twitter.TWITTER_CLIENT_ID,
                    clientSecret: this.credentials.twitter.TWITTER_CLIENT_SECRET
                });

                let refreshed_token = await this.oauthClientToken.refreshOAuth2Token(token.refresh_token);

                resolve({
                    token_type: "bearer",
                    expires_in: refreshed_token.expiresIn,
                    access_token: refreshed_token.accessToken,
                    scope: refreshed_token.scope,
                    refresh_token: refreshed_token.refreshToken,
                });
            } catch (error) {
                reject(error)
            }
        });
    }
};

module.exports = {
    OAuth2
}