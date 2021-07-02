const Axios = require('axios');
const {
    ErrorHandler
} = require('../controllers/error.js')

module.exports =
    class SMS_VERIFICATION {
        constructor() {
            this.axios = Axios
        };

        async send(url, number, auth_token, next) {
            try {
                let result = await this.axios.post(url, {
                    number: number,
                    auth_token: auth_token,
                }).catch(function (error) {
                    throw new ErrorHandler(500, error);
                });

                return result.data;
            } catch (error) {
                next(error);
            }
        };

        async verify(url, number, session_id, code, auth_token, next) {
            try {
                let result = await this.axios.post(url, {
                    session_id: session_id,
                    code: code,
                    auth_token: auth_token,
                    number: number
                }).catch(function (error) {
                    // console.log(error.response.data)
                    if (error.response.data.message == "failed") {
                        throw new ErrorHandler(401, "INVALID 2FA, TRY AGAIN");
                    }

                    throw new ErrorHandler(500, error);
                });

                return result.data;
            } catch (error) {
                next(error);
            }
        }
    }