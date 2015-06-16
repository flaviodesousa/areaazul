'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('funcionario', function(table) {
    table.increments('id_funcionario').primary();
    table.boolean('ativo').notNullable();
    table.bigInteger('empregador_id').notNullable();
    table.bigInteger('pessoa_id').references('id_pessoa').inTable('pessoa');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('funcionario');
};
