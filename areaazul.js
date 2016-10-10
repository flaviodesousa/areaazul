'use strict';

var debug = require('debug')('areaazul:main');
var util = require('util');
const log = require('./logging');

var BusinessException = function(message, details) {
  this.message = message;
  this.details = details;
};
util.inherits(BusinessException, Error);

var AuthenticationError = function(message, details) {
  this.message = message;
  this.details = details;
};
util.inherits(AuthenticationError, Error);

require('./database');

module.exports.BusinessException = BusinessException;
module.exports.AuthenticationError = AuthenticationError;

log.info('AreaAzul configurada');
debug('AreaAzul iniciada');
