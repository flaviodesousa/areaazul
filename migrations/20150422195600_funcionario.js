'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('funcionario', function(table) {
    table.increments('id').primary();
    table.boolean('ativo').notNullable().defaultTo(true);
    table.integer('pessoa_juridica_id')
      .references('id').inTable('pessoa_juridica');
    table.integer('pessoa_fisica_id')
      .references('id').inTable('pessoa_fisica');
    table.unique(['pessoa_juridica_id', 'pessoa_fisica_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('funcionario');
};
