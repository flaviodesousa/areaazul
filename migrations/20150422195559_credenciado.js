'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('credenciado', function(table) {
    table.integer('id')
      .primary()
      .references('id').inTable('pessoa');
    table.boolean('contrato_de_servico_valido');
    table.boolean('inadiplente');
    table.boolean('ativo').notNullable().defaultTo(true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('credenciado');
};
