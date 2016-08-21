var debug = require('debug')('areaazul:configuration:database');

var knexfile = require('../knexfile');

var knex = require('knex')(knexfile[process.env.NODE_ENV || 'development']);
debug('knex loaded');

var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('registry');

module.exports = Bookshelf;
debug('bookshelf loaded', Bookshelf);
