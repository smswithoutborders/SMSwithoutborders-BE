const ERRORS = require("../error.js");
const db = require("../schemas");
const Security = require("./security.models.js");
let logger = require("../logger");

var UserInfo = db.usersInfo;

module.exports = async (phone_number, password) => {
    var security = new Security();

    // SEARCH FOR USERINFO IN DB
    let userInfo = await UserInfo.findAll({
        where: {
            full_phone_number: security.hash(phone_number),
            status: "verified"
        }
    }).catch(error => {
        logger.error("ERROR FINDING USERINFO FROM USERINFO TABLE");
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF USERINFO IS NOT FOUND
    if (userInfo.length < 1) {
        logger.error("NO USERINFO FOUND IN USERINFO TABLE");
        throw new ERRORS.Unauthorized();
    }

    // IF MORE THAN ONE USERINFO EXIST IN DATABASE
    if (userInfo.length > 1) {
        logger.error("DUPLICATE USERINFO FOUND IN USERINFO TABLE");
        throw new ERRORS.Conflict();
    }

    let user = await userInfo[0].getUser({
        where: {
            password: security.hash(password)
        }
    }).catch(error => {
        logger.error("ERROR FINDING USER FROM USERINFO RECORD");
        throw new ERRORS.InternalServerError(error);
    });

    if (!user) {
        logger.error("NO USER FOUND FROM USERINFO RECORD");
        throw new ERRORS.Unauthorized();
    };

    logger.info("USER SUCCESSFULLY VERIFIED RETURNUNG USERID");
    return user.id;
}