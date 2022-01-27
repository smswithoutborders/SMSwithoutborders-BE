const ERRORS = require("../error.js");
const db = require("../schemas");

var Platform = db.platforms;

module.exports = async (platform_name) => {
    // SEARCH FOR PLATFORM IN DB
    let platform = await Platform.findAll({
        where: {
            name: platform_name.toLowerCase()
        }
    }).catch(error => {
        console.error("ERROR FINDING PLATFORM");
        throw new ERRORS.InternalServerError(error);
    })

    // RTURN = [], IF PLATFORM IS NOT FOUND
    if (platform.length < 1) {
        console.error("NO PLATFORM FOUND");
        throw new ERRORS.Forbidden();
    }

    // IF MORE THAN ONE PLATFORM EXIST IN DATABASE
    if (platform.length > 1) {
        console.error("DUPLICATE PLATFORM FOUND");
        throw new ERRORS.Conflict();
    };

    console.log("PLATFORM FOUND RETURNING PLATFORM");
    return platform[0];
}