const crypto = require('crypto');
const config = require('config');
const SERVER_CFG = config.get("SERVER");
const salt = SERVER_CFG.api.SALT;

module.exports =
    class Security {
        constructor(key) {
            this.algorithm = "aes-256-cbc";
            this.key = key ? key.substr(0, 32) : "";
            this.salt = salt ? salt : "";
            this.iv = crypto.randomBytes(16).toString('hex').slice(0, 16);
        };

        encrypt(data, iv) {
            const cipher = crypto.createCipheriv(this.algorithm, this.key, typeof iv == "undefined" ? this.iv : iv)
            var encryptedInfo = cipher.update(data, 'utf8', 'hex') + cipher.final('hex')

            return {
                e_info: encryptedInfo,
                iv: this.iv
            }
        };

        decrypt(data, iv) {
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv)
            const decryptedInfo = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8')

            return decryptedInfo
        };

        hash(data) {
            const hash = crypto.createHmac('sha512', this.salt)
                .update(data)
                .digest('hex');

            return hash;
        };
    };