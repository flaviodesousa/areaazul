'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('usuario_revendedor', function(table) {
    table.bigInteger('pessoa_fisica_pessoa_id')
      .primary()
      .references('pessoa_id').inTable('pessoa_fisica');
    table.string('login').unique().notNullable();
    table.string('senha');
    table.boolean('primeiro_acesso').notNullable();
    table.string('autorizacao').notNullable();
    table.boolean('ativo').notNullable();
    table.bigInteger('revendedor_id')
      .references('pessoa_id').inTable('revendedor');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('usuario_revendedor');
};
