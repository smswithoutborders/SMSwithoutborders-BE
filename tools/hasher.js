var sha512 = require('js-sha512');

let hasher = (string) => {
    let hash = sha512(string);
    let reHash = sha512(hash);

    return reHash;
};

module.exports = hasher;