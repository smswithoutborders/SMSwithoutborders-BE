const Security = require("./security.models.js");

module.exports = async (token, user) => {
    var security = new Security(user.password);

    let decrypted_token = {
        username: JSON.parse(security.decrypt(token.username, token.iv)),
        token: JSON.parse(security.decrypt(token.token, token.iv)),
        uniqueId: JSON.parse(security.decrypt(token.uniqueId, token.iv))
    };

    return decrypted_token;
}