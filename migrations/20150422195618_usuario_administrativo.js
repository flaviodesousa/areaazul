'use strict';

exports.up = function(knex) {
  return knex.schema
    .createTable('usuario_administrativo', function(table) {
      table.bigInteger('pessoa_id')
          .primary()
          .references('pessoa_id').inTable('pessoa_fisica');
      table.string('login').unique().notNullable();
      table.string('senha');
      table.string('autorizacao');
      table.boolean('ativo').notNullable().defaultTo(true);
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('usuario_administrativo');
};
