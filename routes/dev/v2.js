const config = require('config');
const SERVER_CFG = config.get("SERVER");

const fs = require('fs')
const Axios = require('axios');
var rootCas = require('ssl-root-cas').create()

require('https').globalAgent.options.ca = rootCas
axios = Axios;

// ==================== DEVELOPMENT ====================
module.exports = (app) => {

}
// =============================================================