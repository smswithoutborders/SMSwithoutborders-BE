"use strict";

const Security = require("./security.models.js");
const config = require('config');
const SERVER_CFG = config.get("SERVER");
const KEY = SERVER_CFG.api.KEY;
let logger = require("../logger");

module.exports = async (grant, user) => {
    var security = new Security(KEY);

    logger.debug(`Decrypting grant For ${user.id} ...`);
    let decrypted_grant = {
        username: JSON.parse(security.decrypt(grant.username, grant.iv)),
        token: JSON.parse(security.decrypt(grant.token, grant.iv)),
        uniqueId: JSON.parse(security.decrypt(grant.uniqueId, grant.iv))
    };

    logger.info("SUCCESSFULLY DECRYPTED GRANT");
    return decrypted_grant;
}