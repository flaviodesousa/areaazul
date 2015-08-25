'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('estado', function(table) {
    table.increments('id_estado').primary();
    table.string('nome').unique().notNullable();
    table.string('uf').unique().notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('estado');
};
