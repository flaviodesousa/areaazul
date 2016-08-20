'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('movimentacao_conta', function(table) {
    table.increments('id').primary();
    table.timestamp('data_deposito').notNullable();
    table.timestamp('data_estorno');
    table.string('historico').notNullable();
    table.string('tipo').notNullable();
    table.decimal('valor', 18, 2).notNullable();
    table.integer('conta_id').notNullable()
      .references('id').inTable('conta');
    table.integer('pessoa_id').notNullable()
      .references('id').inTable('pessoa');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('movimentacao_conta');
};
