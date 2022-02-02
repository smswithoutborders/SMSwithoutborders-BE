const axios = require('axios');
class twoFactor {
    constructor(credentials) {
        this.credentials = credentials;
    }

    init(phoneNumber) {
        return new Promise((resolve, reject) => {
            try {
                const HOST = this.credentials.telegram.TELEGRAM_REQUEST_HOST;

                axios.post(`${HOST}/`, {
                        phonenumber: phoneNumber
                    })
                    .then(res => {
                        if (res.status == 201) {
                            resolve({
                                status: res.status
                            });
                        };

                        if (res.status == 200) {
                            resolve({
                                status: res.status
                            });
                        }
                    }).catch(err => {
                        reject(err);
                    });
            } catch (error) {
                reject(error)
            }
        });
    };

    validate(phoneNumber, code) {
        return new Promise((resolve, reject) => {
            try {
                const HOST = this.credentials.telegram.TELEGRAM_REQUEST_HOST;

                axios.put(`${HOST}/`, {
                        phonenumber: phoneNumber,
                        code: code
                    })
                    .then(res => {
                        if (res.status == 200) {
                            resolve({
                                md5_hash: res.data,
                                status: res.status
                            });
                        };

                        if (res.status == 202) {
                            resolve({
                                status: res.status
                            });
                        };

                    }).catch(err => {
                        if (err.response.status == 403) {
                            resolve({
                                status: err.response.status
                            });
                        };

                        reject(err);
                    });
            } catch (error) {
                reject(error)
            }
        });
    };

    register(phoneNumber, firstName, lastName) {
        return new Promise((resolve, reject) => {
            try {
                const HOST = this.credentials.telegram.TELEGRAM_REQUEST_HOST;

                axios.post(`${HOST}/users`, {
                        phonenumber: phoneNumber,
                        first_name: firstName,
                        last_name: lastName
                    })
                    .then(res => {
                        if (res.status == 200) {
                            resolve({
                                md5_hash: res.data,
                                status: res.status
                            });
                        };
                    }).catch(err => {
                        reject(err);
                    });
            } catch (error) {
                reject(error)
            }
        });
    }

    revoke(originalURL, token) {
        return new Promise((resolve, reject) => {

        });
    }
};

module.exports = {
    twoFactor
}