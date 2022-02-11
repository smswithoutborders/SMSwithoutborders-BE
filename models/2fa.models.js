"use strict";

const config = require('config');
const SERVER_CFG = config.get("SERVER");
const credentials = config.get("CREDENTIALS");
let logger = require("../logger");

const Axios = require('axios');
const ERRORS = require("../error.js");
const chalk = require("chalk");
const AUTH_TOKEN = credentials.twilio.AUTH_TOKEN;

if (!SERVER_CFG.router.url) {
    logger.warn(chalk.red("NO ROUTER URL PRESENT IN CONFIGS"));
};

if (!SERVER_CFG.router.port) {
    logger.warn(chalk.red("NO ROUTER PORT PRESENT IN CONFIGS"));
};

let send = async (number) => {
    const url = `${SERVER_CFG.router.url}:${SERVER_CFG.router.port}/sms/twilio`;

    logger.debug("Requesting OTP code ...")
    let result = await Axios.post(url, {
        number: number,
        auth_token: AUTH_TOKEN,
    }).catch(function (error) {
        logger.error("ERROR REQUESTING OTP CODE CHECK INPUTS OR INTERNET CONNECTION")
        throw new ERRORS.InternalServerError(error);
    });

    logger.info("OTP CODE REQUESTED SUCCESFULLY");
    return {
        state: "success",
        data: result.data
    };
};

let verify = async (number, session_id, code) => {
    const url = `${SERVER_CFG.router.url}:${SERVER_CFG.router.port}/sms/twilio/verification_token`;

    logger.debug("Verifying OTP code ...")
    let result = await Axios.post(url, {
        session_id: session_id,
        code: code,
        auth_token: AUTH_TOKEN,
        number: number
    }).catch(function (error) {
        logger.error("ERROR VERIFYING OTP CODE CHECK INPUTS OR INTERNET CONNECTION")
        if (error.response.data.message == "failed") {
            logger.error("OTP API RESPONDED WITH FAILED")
            throw new ERRORS.Forbidden();
        }

        throw new ERRORS.InternalServerError(error);
    });

    logger.info("OTP VERIFICATION SUCCESFUL");
    return result.data;
};

module.exports = {
    send,
    verify
}