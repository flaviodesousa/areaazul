'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('veiculo', function(table) {
    table.increments('id').primary();
    table.string('placa').unique().notNullable();
    table.string('marca');
    table.string('modelo');
    table.string('cor');
    table.bigInteger('ano_fabricado');
    table.bigInteger('ano_modelo');
    table.boolean('ativo').notNullable().defaultTo(true);
    table.integer('cidade_id')
      .references('id').inTable('cidade');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('veiculo');
};
