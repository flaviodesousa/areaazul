'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('pessoa', function(table) {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.string('email').notNullable();
    table.string('telefone');
    table.string('observacao');
    table.boolean('ativo').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('pessoa');
};
