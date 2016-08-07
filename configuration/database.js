var knexfile = require('../knexfile');

var env = process.env.NODE_ENV || 'development';

var knex = require('knex')(knexfile[env]);

exports.Bookshelf = require('bookshelf');
exports.Bookshelf.conexaoMain = require('bookshelf')(knex);
