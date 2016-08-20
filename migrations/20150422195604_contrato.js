'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('contrato', function(table) {
    table.increments('id').primary();
    table.string('numero').notNullable();
    table.timestamp('data_inicio').notNullable();
    table.timestamp('data_termino');
    table.boolean('ativo').notNullable().defaultTo(true);
    table.integer('pessoa_id').notNullable()
      .references('id').inTable('pessoa');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('contrato');
};
