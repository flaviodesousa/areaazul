'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('veiculo', function(table) {
    table.increments('id').primary();
    table.string('placa').unique().notNullable();
    table.enu('tipo', [ 'carro', 'moto', 'utilitário' ]).notNullable();
    table.string('marca');
    table.string('modelo');
    table.string('cor');
    table.integer('ano_fabricado');
    table.integer('ano_modelo');
    table.integer('cidade_id')
      .references('id').inTable('cidade');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('veiculo');
};
