const ERRORS = require("../error.js");
const db = require("../schemas");
const Security = require("./security.models.js");

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
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF USERINFO IS NOT FOUND
    if (userInfo.length < 1) {
        throw new ERRORS.NotFound();
    }

    // IF MORE THAN ONE USERINFO EXIST IN DATABASE
    if (userInfo.length > 1) {
        throw new ERRORS.Conflict();
    }

    let user = await userInfo[0].getUser({
        where: {
            password: security.hash(password)
        }
    }).catch(error => {
        throw new ERRORS.InternalServerError(error);
    });

    if (!user) {
        throw new ERRORS.NotFound();
    };

    return user.id;
}