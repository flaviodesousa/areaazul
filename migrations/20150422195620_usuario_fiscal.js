'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('usuario_fiscal', function(table) {
    table.integer('id')
      .primary()
      .references('id').inTable('pessoa_fisica');
    table.string('login').unique().notNullable();
    table.string('senha');
    table.integer('conta_id').notNullable()
      .references('id').inTable('conta');
    table.boolean('ativo').notNullable().defaultTo(true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('usuario_fiscal');
};
