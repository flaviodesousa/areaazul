var knexfile = require('../knexfile');

var env = process.env.NODE_ENV || 'development';

var knex = require('knex')(knexfile[env]);
knex.migrate.latest();
var Bookshelf = require('bookshelf')(knex);
Bookshelf.conexaoMain = Bookshelf;
