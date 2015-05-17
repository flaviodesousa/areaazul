'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('usuario_has_veiculo', function(table) {
    table.primary(['usuario_pessoa_id', 'veiculo_id']);
    table.bigInteger('usuario_pessoa_id')
      .notNullable()
      .references('pessoa_id').inTable('usuario');
    table.bigInteger('veiculo_id')
      .notNullable()
      .references('id_veiculo').inTable('veiculo');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('usuario_has_veiculo');
};
