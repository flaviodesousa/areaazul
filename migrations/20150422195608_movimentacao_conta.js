'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('movimentacao_conta', function(table) {
    table.increments('id').primary();
    table.timestamp('data').notNullable();
    table.decimal('valor', 18, 2).notNullable();
    // Coluna auxiliar para simplificar a emissão de extratos
    table.decimal('saldo_resultante', 18, 2).notNullable();
    table.string('historico').notNullable();
    table.string('tipo').notNullable();
    table.integer('conta_id').notNullable()
      .references('id').inTable('conta');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('movimentacao_conta');
};
