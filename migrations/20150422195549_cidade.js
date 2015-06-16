'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('cidade', function(table) {
    table.increments('id_cidade').primary();
    table.string('nome').notNullable();
    table.boolean('ativo').notNullable();
    table.integer('estado_id').notNullable()
      .references('id_estado').inTable('estado');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('cidade');
};
