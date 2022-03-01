const {
    body
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
    return [body('country_code')
        .exists({
            checkFalsy: true
        })
        .withMessage("NO COUNTRY CODE")
    ]
}

module.exports = {
    phoneNumber: phoneNumber(),
    password: password(),
    countryCode: countryCode()
}