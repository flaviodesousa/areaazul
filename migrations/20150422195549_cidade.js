'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('cidade', function(table) {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.string('nome_busca').notNullable()
      .comment('Nome da cidade sem acentos, para buscas');
    table.integer('estado_id').notNullable()
      .references('id').inTable('estado');
    table.index('nome_busca');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('cidade');
};
