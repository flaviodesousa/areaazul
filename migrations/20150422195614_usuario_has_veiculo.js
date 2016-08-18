'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('usuario_has_veiculo', function(table) {
    // Bug Bookshelf, nao atribui id de PK composta impossibilitando update
    // table.primary(['usuario_pessoa_id', 'veiculo_id']);
    // Coluna PK abaixo incluida enquanto bug nao for corrigido
    table.increments('id_usuario_has_veiculo').primary();
    table.integer('usuario_pessoa_id')
      .notNullable()
      .references('pessoa_id').inTable('usuario');
    table.integer('veiculo_id')
      .notNullable()
      .references('id_veiculo').inTable('veiculo');
    table.timestamp('ultima_ativacao');
    table.unique(['usuario_pessoa_id', 'veiculo_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('usuario_has_veiculo');
};
