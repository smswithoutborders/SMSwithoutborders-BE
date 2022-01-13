const {
    google
} = require('googleapis');

class OAuth_2_0 {
    constructor(credentials, token_scopes) {
        this.credentials = credentials;
        this.oauth2ClientToken = {};
        this.token_scopes = token_scopes;
    }

    init(originalURL) {
        return new Promise(async (resolve, reject) => {
            try {
                this.oauth2ClientToken = new google.auth.OAuth2(
                    this.credentials.google.GOOGLE_CLIENT_ID,
                    this.credentials.google.GOOGLE_CLIENT_SECRET,
                    `${originalURL}/dashboard/oauth2/google/Tokens/redirect/`
                );

                let token_url = await this.oauth2ClientToken.generateAuthUrl({
                    // 'online' (default) or 'offline' (gets refresh_token)
                    access_type: 'offline',

                    // If you only need one scope you can pass it as a string
                    scope: this.token_scopes
                });

                resolve({
                    url: token_url
                });
            } catch (error) {
                reject(
                    error
                );
            };
        });
    };

    validate(originalURL, code) {
        return new Promise(async (resolve, reject) => {
            try {
                this.oauth2ClientToken = new google.auth.OAuth2(
                    this.credentials.google.GOOGLE_CLIENT_ID,
                    this.credentials.google.GOOGLE_CLIENT_SECRET,
                    `${originalURL}/dashboard/oauth2/google/Tokens/redirect/`
                );

                const {
                    tokens
                } = await this.oauth2ClientToken.getToken(code);
                this.oauth2ClientToken.setCredentials(tokens);

                // get profile data
                let gmail = await google.oauth2({
                    auth: this.oauth2ClientToken,
                    version: 'v2'
                });

                let profile = await gmail.userinfo.get();

                resolve({
                    profile: profile,
                    token: tokens
                })
            } catch (error) {
                reject(
                    error
                );
            };
        });
    };

    revoke(originalURL, token) {
        return new Promise(async (resolve, reject) => {
            try {
                this.oauth2ClientToken = new google.auth.OAuth2(
                    this.credentials.google.GOOGLE_CLIENT_ID,
                    this.credentials.google.GOOGLE_CLIENT_SECRET,
                    `${originalURL}/dashboard/oauth2/google/Tokens/redirect/`
                );

                await this.oauth2ClientToken.setCredentials(token);

                await this.oauth2ClientToken.getAccessToken(async (err, access_token) => {
                    if (err) {
                        reject(err);
                    };

                    await this.oauth2ClientToken.revokeToken(access_token).catch(err => {
                        if (err) {
                            reject(err);
                        };
                    });

                    resolve(true);
                });
            } catch (error) {
                reject(
                    error
                );
            };
        });
    };
};

module.exports = {
    OAuth_2_0
}