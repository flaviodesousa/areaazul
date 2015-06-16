'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('pessoa_fisica', function(table) {
    table.integer('pessoa_id')
      .primary()
      .references('id_pessoa').inTable('pessoa');
    table.string('cpf').unique().notNullable();
    table.date('data_nascimento');
    table.string('sexo');
    table.boolean('ativo').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('pessoa_fisica');
};
