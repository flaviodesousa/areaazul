var path = require('path');
var knexfile = require('../knexfile');

var env = process.env.NODE_ENV || 'development';

var knex = require('knex')(knexfile[env]);
var migrations_config = {
    directory: path.join(__dirname, '..', 'migrations')
};
console.log('migrations_config: ');
console.dir(migrations_config);
knex.migrate.latest();

exports.Bookshelf = require('bookshelf');
exports.Bookshelf.conexaoMain = require('bookshelf')(knex);
