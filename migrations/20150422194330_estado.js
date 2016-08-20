'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('estado', function(table) {
    table.increments('id').primary();
    table.string('nome').unique().notNullable();
    table.string('uf').unique().notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('estado');
};
