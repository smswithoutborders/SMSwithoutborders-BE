var crypto = require('crypto');
module.exports =
    class Security {
        constructor(key) {
            this.algorithm = "aes-256-cbc";
            this.key = key ? key.substr(0, 32) : "";
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
            var hash = crypto.createHash("sha512");
            hash.update(data)

            return hash.digest("hex");
        };
    };

// let security = new Security();
// let testHash = security.hash("testdata");
// let testEnc = security.encrypt("Hello world");
// let testDec = security.decrypt(testEnc.e_info, testEnc.iv);

// console.log(testHash);
// console.log(testEnc);
// console.log(testDec);