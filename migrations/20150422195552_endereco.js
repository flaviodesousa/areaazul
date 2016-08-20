'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('endereco', function(table) {
    table.increments('id').primary();
    table.string('cep').notNullable();
    table.string('complemento');
    table.string('lote');
    table.string('numero');
    table.string('quadra');
    table.string('logradouro').notNullable();
    table.boolean('ativo').notNullable().defaultTo(true);
    table.integer('cidade_id').notNullable()
      .references('id').inTable('cidade');
    table.integer('bairro_id').notNullable()
      .references('id').inTable('bairro');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('endereco');
};
