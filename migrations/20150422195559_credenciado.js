'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('credenciado', function(table) {
    table.integer('pessoa_id')
      .primary()
      .references('id').inTable('pessoa');
    table.boolean('contrato_de_servico_valido');
    table.boolean('inadiplente');
    table.boolean('ativo').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('credenciado');
};
