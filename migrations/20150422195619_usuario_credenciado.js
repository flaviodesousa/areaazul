'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('usuario_credenciado', function(table) {
    table.integer('id')
      .primary()
      .references('id').inTable('pessoa_fisica');
    table.string('login').unique().notNullable();
    table.string('senha');
    table.boolean('primeiro_acesso').notNullable();
    table.boolean('ativo').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('usuario_credenciado');
};
