'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('configuracao', function(table) {
    table.increments('id').primary();
    table.decimal('franquia').notNullable();
    table.decimal('tempo_tolerancia').notNullable();
    table.decimal('ciclo_ativacao').notNullable();
    table.decimal('ciclo_fiscalizacao').notNullable();
    table.decimal('valor_ativacao').notNullable();
    table.integer('cidade_id').notNullable()
      .references('id').inTable('cidade');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('configuracao');
};
