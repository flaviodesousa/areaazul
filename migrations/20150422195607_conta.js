'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('conta', function(table) {
    table.increments('id_conta').primary();
    table.timestamp('data_abertura').notNullable();
    table.timestamp('data_fechamento');
    table.decimal('saldo', 18, 2).notNullable().defaultTo(0);
    table.boolean('ativo').notNullable().defaultTo(true);
    table.bigInteger('pessoa_id').notNullable()
      .references('id_pessoa').inTable('pessoa');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('conta');
};
