'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('usuario_revendedor', function(table) {
    table.increments('id').primary();
    table.integer('pessoa_id').notNullable()
      .references('pessoa_id').inTable('pessoa_fisica');
    table.string('login').unique().notNullable();
    table.string('senha');
    table.boolean('acesso_confirmado').notNullable();
    table.string('autorizacao').notNullable();
    table.boolean('ativo').notNullable();
    table.integer('revendedor_id').notNullable()
      .references('pessoa_id').inTable('revendedor');
    table.unique(['pessoa_id', 'revendedor_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('usuario_revendedor');
};
