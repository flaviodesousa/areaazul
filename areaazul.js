'use strict';

module.exports.log = require('./configuration/logging');
module.exports.db = require('./configuration/database');
module.exports.models = require('./models/models');
module.exports.collections = require('./models/collections');
module.exports.BusinessException = function(message, details) {
  this.message = message;
  this.details = details;
};
module.exports.log.info('areaazul initialized');
