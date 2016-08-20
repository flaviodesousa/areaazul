'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('bairro', function(table) {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.boolean('ativo').notNullable().defaultTo(true);
    table.integer('cidade_id').notNullable()
      .references('id').inTable('cidade');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('bairro');
};
