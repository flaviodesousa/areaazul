'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('funcionario', function(table) {
    table.increments('id').primary();
    table.boolean('ativo').notNullable();
    table.bigInteger('empregador_id').notNullable();
    table.bigInteger('pessoa_id').references('id').inTable('pessoa');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('funcionario');
};
