'use strict';

var util = require('util');

module.exports.log = require('./configuration/logging');
module.exports.db = require('./configuration/database');
module.exports.models = require('./models/models');
module.exports.collections = require('./models/collections');
module.exports.BusinessException = function(message, details) {
  this.message = message;
  this.details = details;
};
util.inherits(module.exports.BusinessException, Error);
module.exports.log.info('areaazul initialized');
