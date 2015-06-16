'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('endereco', function(table) {
    table.increments('id_endereco').primary();
    table.string('cep').notNullable();
    table.string('complemento');
    table.string('lote');
    table.string('numero');
    table.string('quadra');
    table.string('logradouro').notNullable();
    table.boolean('ativo').notNullable();
    table.integer('cidade_id').notNullable()
      .references('id_cidade').inTable('cidade');
    table.integer('bairro_id').notNullable()
      .references('id_bairro').inTable('bairro');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('endereco');
};
