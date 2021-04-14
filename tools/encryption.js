var crypto = require('crypto');
const configs = require("./credentials.json");

const algorithm = "aes-256-cbc";
const Key = configs.key;
key = Key.substr(0, 32)
const IV = crypto.randomBytes(16).toString('hex').slice(0, 16)


function encrypt(data, iv) {
    const Iv = typeof iv == "undefined" ? IV : iv
    const cipher = crypto.createCipheriv(algorithm, key, Iv)
    var encryptedInfo = cipher.update(data, 'utf8', 'hex') + cipher.final('hex')

    return {
        e_info: encryptedInfo,
        iv: Iv
    };
};

function decrypt(data, iv) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    const decryptedInfo = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8')

    return decryptedInfo
};

module.exports = {
    encrypt,
    decrypt,
    IV
}