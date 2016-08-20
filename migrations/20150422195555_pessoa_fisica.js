'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('pessoa_fisica', function(table) {
    table.integer('id')
      .primary()
      .references('id').inTable('pessoa');
    table.string('cpf').unique().notNullable();
    table.date('data_nascimento');
    table.boolean('ativo').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('pessoa_fisica');
};
