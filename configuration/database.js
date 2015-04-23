var knexfile = require('../knexfile');

var env = process.env.NODE_ENV || 'development';

var knex = require('knex')(knexfile[env]);
knex.migrate.latest();

export.Bookshelf = require('bookshelf')(knex);
export.Bookshelf.conexaoMain = export.Bookshelf;
