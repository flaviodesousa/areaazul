'use strict';

var winston = require('winston');
require('winston-loggly');

(function() {
  var env = process.env.NODE_ENV || 'development';

  winston.add(winston.transports.Loggly, {
    inputToken:
      process.env.AREAAZUL_LOGGLY_TOKEN ||
        '2cd112b3-29ff-4c0d-8872-8d41353a9f1a',
    subdomain: 'areaazul',
    tags: ['model'],
    json: true,
  });

  winston.add(winston.transports.File, {
    filename:
      process.env.AREAAZUL_FILE_LOG ||
        '/tmp/areaazul.log',
  });

  if (env !== 'development') {
    winston.remove(winston.transports.Console);
  }

  // Comandos console redirecionam para winston
  // assim codigo usando console automaticamente
  // gera logs compativeis com winston
  // require('console-winston')();

  winston.info('Logging started');
})();

module.exports = winston;
