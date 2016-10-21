'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('configuracao', function(table) {
    table.increments('id').primary();
    table.decimal('franquia_minutos').notNullable();
    table.decimal('tempo_tolerancia_minutos').notNullable();
    table.decimal('ciclo_ativacao_minutos').notNullable();
    table.decimal('ciclo_fiscalizacao_minutos').notNullable();
    table.decimal('valor_ativacao_reais', 18, 2).notNullable();
    table.json('parametros');
    table.integer('cidade_id').notNullable()
      .references('id').inTable('cidade');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('configuracao');
};
