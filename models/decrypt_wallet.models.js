const Security = require("./security.models.js");
let logger = require("../logger");

module.exports = async (token, user) => {
    var security = new Security(user.password);

    logger.debug(`Decrypting Wallet For ${user.id} ...`);
    let decrypted_token = {
        username: JSON.parse(security.decrypt(token.username, token.iv)),
        token: JSON.parse(security.decrypt(token.token, token.iv)),
        uniqueId: JSON.parse(security.decrypt(token.uniqueId, token.iv))
    };

    logger.info("SUCCESSFULLY DECRYPTED WALLET");
    return decrypted_token;
}