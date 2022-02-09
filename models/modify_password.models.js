"use strict";

const Security = require("./security.models.js");
let logger = require("../logger");

module.exports = async (user, new_password) => {
    var security = new Security();

    logger.debug(`Updating Password for ${user.id}...`);

    await user.update({
        password: security.hash(new_password)
    });

    logger.info("SUCCESSFULLY UPDATED PASSWORD");
    return true;
};