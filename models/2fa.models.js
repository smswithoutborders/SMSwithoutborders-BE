const Axios = require('axios');
const ERRORS = require("../error.js");
const configs = require("../config.json");
const credentials = require("../credentials.json");
const chalk = require("chalk");
const AUTH_TOKEN = credentials.twilio.AUTH_TOKEN;

if (!configs.router.url) {
    console.warn(chalk.red("NO ROUTER URL PRESENT IN CONFIGS"));
};

if (!configs.router.port) {
    console.warn(chalk.red("NO ROUTER PORT PRESENT IN CONFIGS"));
};

let send = async (number) => {
    const url = `${configs.router.url}:${configs.router.port}/sms/twilio`;

    let result = await Axios.post(url, {
        number: number,
        auth_token: AUTH_TOKEN,
    }).catch(function (error) {
        console.error("ERROR REQUESTING VERIFICATION CODE FROM TWILIO CHECK INPUTS OR INTERNET CONNECTION")
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
        console.error("ERROR VERIFYING CODE FROM TWILIO CHECK INPUTS OR INTERNET CONNECTION")
        if (error.response.data.message == "failed") {
            console.error("TWILIO API RESPONDED WITH FAILED")
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