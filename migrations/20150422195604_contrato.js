'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('contrato', function(table) {
    table.increments('id_contrato').primary();
    table.bigInteger('numero').notNullable();
    table.timestamp('data_inicio').notNullable;
    table.timestamp('data_termino');
    table.boolean('ativo').notNullable();
    table.bigInteger('pessoa_id').notNullable()
      .references('id_pessoa').inTable('pessoa');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('contrato');
};
