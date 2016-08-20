'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('cidade', function(table) {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.integer('estado_id').notNullable()
      .references('id').inTable('estado');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('cidade');
};
