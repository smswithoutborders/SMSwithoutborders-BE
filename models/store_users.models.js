const ERRORS = require("../error.js");
const db = require("../schemas");
const Security = require("./security.models.js");

const User = db.users;
const UserInfo = db.usersInfo;

module.exports = async (country_code, phone_number, password, name) => {
    let security = new Security();

    let newUser = await User.create({
        password: security.hash(password),
    }).catch(error => {
        console.error("ERROR CREATING USER PASSWORD IN USER'S TABLE");
        if (error.name == "SequelizeUniqueConstraintError") {
            if (error.original.code == "ER_DUP_ENTRY") {
                console.error("USER ALREADY HAS RECORD IN USER'S TABLE");
                throw new ERRORS.Conflict();
            };
        };

        throw new ERRORS.InternalServerError(error);
    });

    await UserInfo.create({
        phone_number: phone_number,
        name: name,
        country_code: country_code,
        full_phone_number: country_code + phone_number,
        userId: newUser.id
    }).catch(error => {
        console.error("ERROR CREATING USER IN USERSINFO TABLE");
        if (error.name == "SequelizeUniqueConstraintError") {
            console.error("USER ALREADY HAS RECORD IN USERINFO TABLE");
            if (error.original.code == "ER_DUP_ENTRY") {
                throw new ERRORS.Conflict();
            };
        };

        throw new ERRORS.InternalServerError(error);
    });

    console.log("SUCCESSFULLY STORED USER RETURNING USERID");
    return newUser.id;
}