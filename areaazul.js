'use strict';

var util = require('util');

var BusinessException = function(message, details) {
  this.message = message;
  this.details = details;
};
util.inherits(BusinessException, Error);

module.exports.log = require('./configuration/logging');
module.exports.db = require('./configuration/database');
module.exports.models = require('./models/models');
module.exports.collections = require('./models/collections');
module.exports.BusinessException = BusinessException;
module.exports.log.info('areaazul initialized');
