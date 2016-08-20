'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('pessoa_juridica', function(table) {
    table.integer('id')
      .primary()
      .references('id').inTable('pessoa');
    table.string('cnpj').unique().notNullable();
    table.string('nome_fantasia').notNullable();
    table.string('razao_social').notNullable();
    table.string('contato').notNullable();
    table.boolean('ativo').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('pessoa_juridica');
};
