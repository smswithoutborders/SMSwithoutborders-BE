const Axios = require('axios');
const {
    ErrorHandler
} = require('../controllers/error.js')

module.exports = class SMS_VERIFICATION {
    constructor() {
        this.axios = Axios
    };

    async send(url, number, auth_token, next) {
        try {
            await this.axios.post(url, {
                    number: number,
                    auth_token: auth_token,
                })
                .then(async function (response) {
                    let result = response.data;

                    return result;
                })
                .catch(function (error) {
                    throw new ErrorHandler(500, error);
                });
        } catch (error) {
            next(error);
        }
    };

    async verify(url, number, session_id, code, auth_token, next) {
        try {
            await this.axios.post(url, {
                    session_id: session_id,
                    code: code,
                    auth_token: auth_token,
                    number: number
                })
                .then(async function (response) {
                    let result = response.data;

                    return result;
                })
                .catch(function (error) {
                    throw new ErrorHandler(500, error);
                });
        } catch (error) {
            next(error);
        }
    }
}