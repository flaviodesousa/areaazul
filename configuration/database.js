var path = require('path');
var knexfile = require('../knexfile');

var env = process.env.NODE_ENV || 'development';

var knex = require('knex')(knexfile[env]);
var migrations_config = {
  directory: path.join(__dirname, '..', 'migrations')
};
knex.migrate.latest(migrations_config);

exports.Bookshelf = require('bookshelf');
exports.Bookshelf.conexaoMain = require('bookshelf')(knex);
