'use strict';

const winston = require('winston');
const fs = require('fs');
const moment = require('moment');
const level = process.env.AREAAZUL_LOG_LEVEL;
const logDir = process.env.AREAAZUL_LOG_DIR;
const logFileBase = process.env.AREAAZUL_LOG_FILE_BASE;
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
function tsFormat() { return moment().utc().format(); }
let transports = [
  new (require('winston-daily-rotate-file'))({
    filename: `${logDir}/-${logFileBase}.log`,
    timestamp: tsFormat,
    datePattern: 'yyyy-MM-dd',
    prepend: true,
    level: level
  })
];
if (process.env.AREAAZUL_LOG_CONSOLE) {
  transports.push(
    // Colorize the output to the console
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      level: 'info'
    })
  );
}
const logger = new (winston.Logger)({
  transports: transports
});

module.exports = logger;
