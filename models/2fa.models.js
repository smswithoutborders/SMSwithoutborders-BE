const Axios = require('axios');
const ERRORS = require("../error.js");
const configs = require("../config.json");
const credentials = require("../credentials.json");
const AUTH_TOKEN = credentials.twilio.AUTH_TOKEN;

let send = async (number) => {
    const url = `${configs.router.url}:${configs.router.port}/sms/twilio`;

    let result = await Axios.post(url, {
        number: number,
        auth_token: AUTH_TOKEN,
    }).catch(function (error) {
        throw new ERRORS.InternalServerError(error);
    });

    return result.data;
};

let verify = async (number, session_id, code) => {
    const url = `${configs.router.url}:${configs.router.port}/sms/twilio/verification_token`;

    let result = await Axios.post(url, {
        session_id: session_id,
        code: code,
        auth_token: AUTH_TOKEN,
        number: number
    }).catch(function (error) {
        if (error.response.data.message == "failed") {
            throw new ERRORS.Unauthorized();
        }

        throw new ERRORS.InternalServerError(error);
    });

    return result.data;
};

module.exports = {
    send,
    verify
}