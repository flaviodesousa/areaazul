'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('usuario_has_veiculo', function(table) {
    table.increments('id').primary();
    table.integer('usuario_id')
      .notNullable()
      .references('id').inTable('usuario');
    table.integer('veiculo_id')
      .notNullable()
      .references('id').inTable('veiculo');
    table.timestamp('ultima_ativacao');
    table.unique(['usuario_id', 'veiculo_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('usuario_has_veiculo');
};
