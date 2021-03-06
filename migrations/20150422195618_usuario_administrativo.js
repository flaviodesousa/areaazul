'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('usuario_administrativo', function(table) {
    table.integer('id')
      .primary()
      .references('id').inTable('pessoa_fisica');
    table.string('login').unique().notNullable();
    table.string('senha');
    table.string('autorizacao');
    table.boolean('ativo').notNullable().defaultTo(true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('usuario_administrativo');
};
