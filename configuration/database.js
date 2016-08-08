var debug = require('debug')('areaazul:configuration:database');

var knexfile = require('../knexfile');

var env = process.env.NODE_ENV || 'development';

var knex = require('knex')(knexfile[env]);
debug('knex loaded');

exports.Bookshelf = require('bookshelf');

exports.Bookshelf.conexaoMain = require('bookshelf')(knex);
debug('bookshelf loaded');
exports.Bookshelf.conexaoMain.plugin('registry');
