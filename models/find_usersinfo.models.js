const ERRORS = require("../error.js");
const db = require("../schemas");
const Security = require("./security.models.js");

const UserInfo = db.usersInfo;

module.exports = async (country_code, phone_number) => {
    var security = new Security();
    const full_phone_number = security.hash(country_code + phone_number)

    // SEARCH FOR USERINFO IN DB
    let userInfo = await UserInfo.findAll({
        where: {
            full_phone_number: full_phone_number,
            status: "verified"
        }
    }).catch(error => {
        console.error("ERROR FINDING USERINFO");
        throw new ERRORS.InternalServerError(error);
    });

    if (userInfo.length < 1) {
        return null
    }

    console.log("USERINFO FOUND RETURNING USER")
    return userInfo[0];
}