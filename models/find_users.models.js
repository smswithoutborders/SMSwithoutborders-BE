const ERRORS = require("../error.js");
const db = require("../schemas");

var User = db.users;

module.exports = async (id) => {
    // SEARCH FOR USER IN DB
    let user = await User.findAll({
        where: {
            id: id
        }
    }).catch(error => {
        console.error("ERROR FINDING USER IN USER TABLE")
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF USER IS NOT FOUND
    if (user.length < 1) {
        console.error("NO USER FOUND");
        throw new ERRORS.Forbidden();
    }

    // IF MORE THAN ONE USER EXIST IN DATABASE
    if (user.length > 1) {
        console.error("DUPLICATE USER FOUND");
        throw new ERRORS.Conflict();
    }

    console.log("USER FOUND RETURNUNG USER")
    return user[0];
}