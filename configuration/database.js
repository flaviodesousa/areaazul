var path = require('path');
var knexfile = require('../knexfile');

var env = process.env.NODE_ENV || 'development';

var knex = require('knex')(knexfile[env]);
knex.migrate.latest({
  directory: path.join(__dirname, '..', 'migrations')
});

exports.Bookshelf = require('bookshelf');
exports.Bookshelf.conexaoMain = require('bookshelf')(knex);
