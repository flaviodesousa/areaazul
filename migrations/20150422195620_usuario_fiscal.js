'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('usuario_fiscal', function(table) {
    table.integer('pessoa_id')
      .primary()
      .references('pessoa_id').inTable('pessoa_fisica');
    table.string('login').unique().notNullable();
    table.string('senha');
    table.boolean('primeiro_acesso').notNullable();
    table.integer('conta_id').notNullable()
      .references('id_conta').inTable('conta');
    table.boolean('ativo').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('usuario_fiscal');
};
