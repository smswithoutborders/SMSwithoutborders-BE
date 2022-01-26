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
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF USER IS NOT FOUND
    if (user.length < 1) {
        throw new ERRORS.Forbidden();
    }

    // IF MORE THAN ONE USER EXIST IN DATABASE
    if (user.length > 1) {
        throw new ERRORS.Conflict();
    }

    return user[0];
}