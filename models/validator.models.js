const {
    body,
    header,
    param,
    cookie
} = require('express-validator');

// Phone number input validation
let phoneNumber = () => {
    return [
        body('phone_number')
        .isNumeric()
        .withMessage("INVALID PHONE NUMBER")
        .exists({
            checkFalsy: true
        })
        .withMessage("NO PHONE NUMBER")
    ]
};

// Password input validation
let password = () => {
    return [
        body('password')
        .exists({
            checkFalsy: true
        })
        .withMessage("NO PASSWORD")
        .isLength({
            min: 8
        })
        .withMessage("PASSWORD < 8 CHARS")
    ]
};

let countryCode = () => {
    return [
        body('country_code')
        .exists({
            checkFalsy: true
        })
        .withMessage("NO COUNTRY CODE")
    ]
};

let code = () => {
    return [
        body('code')
        .exists({
            checkFalsy: true
        })
        .withMessage("NO CODE")
    ]
};

let sessionId = () => {
    return [
        body('session_id')
        .exists({
            checkFalsy: true
        })
        .withMessage("NO SESSION ID")
    ]
};

let svid = () => {
    return [
        body('svid')
        .exists({
            checkFalsy: true
        })
        .withMessage("NO SVID")
    ]
};

let name = () => {
    return [
        body('name')
        .if(body("name").exists({
            checkFalsy: true
        }))
        .isAlphanumeric()
        .withMessage("INVALID CHARACTERS IN NAME")
    ]
};

let userAgent = () => {
    return [
        header('user-agent')
        .exists({
            checkFalsy: true
        })
        .withMessage("NO USER AGENT")
    ]
};

let cookies = () => {
    return [
        cookie('SWOB')
        .exists({
            checkFalsy: true
        })
        .withMessage("NO COOKIE")
    ]
};

let userId = () => {
    return [
        param('user_id')
        .exists({
            checkFalsy: true
        })
        .withMessage("NO USERID")
    ]
};

let newPassword = () => {
    return [
        param('new_password')
        .exists({
            checkFalsy: true
        })
        .withMessage("NO NEW PASSWORD")
        .isLength({
            min: 8
        })
        .withMessage("NEW PASSWORD < 8 CHARS")
    ]
};

module.exports = {
    phoneNumber: phoneNumber(),
    password: password(),
    countryCode: countryCode(),
    code: code(),
    sessionId: sessionId(),
    svid: svid(),
    name: name(),
    userAgent: userAgent(),
    cookies: cookies(),
    userId: userId(),
    newPassword: newPassword()
}