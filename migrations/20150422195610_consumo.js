'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('consumo', function(table) {
    table.increments('id_consumo').primary();
    table.timestamp('data_ativacao').notNullable();
    table.timestamp('data_desativacao');
    table.decimal('valor', 18, 2).notNullable();
    table.boolean('ativo').notNullable();
    table.integer('veiculo_id').notNullable()
      .references('id_veiculo').inTable('veiculo');
    table.integer('pessoa_id').notNullable()
      .references('id_pessoa').inTable('pessoa');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('consumo');
};
