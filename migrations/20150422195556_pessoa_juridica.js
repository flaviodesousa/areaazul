'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('pessoa_juridica', function(table) {
    table.bigInteger('pessoa_id')
      .primary()
      .references('id_pessoa').inTable('pessoa');
    table.string('cnpj').unique().notNullable();
    table.string('nome_fantasia').notNullable();
    table.string('razao_social').notNullable();
    table.string('inscricao_estadual')
    table.string('contato').notNullable();
    table.string('ramo_atividade');
    table.boolean('ativo').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('pessoa_juridica');
};
