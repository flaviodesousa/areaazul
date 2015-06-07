module.exports.log = require('./configuration/logging');
require('./configuration/database');
module.exports.models = require('./models/models');
module.exports.collections = require('./models/collections');
module.exports.log.info('areaazul initialized');
