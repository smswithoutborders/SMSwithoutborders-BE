const winston = require('winston');
const path = require("path");

let logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.errors({
            stack: true
        }), // <-- use errors format
        winston.format.timestamp(),
        winston.format.prettyPrint()
    ),
    level: 'debug',
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, 'logs/combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d'
        }),
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, 'logs/error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
            level: 'error'
        }),
        new winston.transports.Console({
            format: winston.format.cli()
        }),
    ],
    exceptionHandlers: [
        new winston.transports.Console({
            format: winston.format.cli()
        }),
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, 'logs/exception-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d'
        }),
    ],
    exitOnError: false
});

module.exports = logger;