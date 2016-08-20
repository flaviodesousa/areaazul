'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('ativacao', function(table) {
    table.increments('id').primary();
    table.timestamp('data_ativacao').notNullable();
    table.timestamp('data_desativacao');
    table.decimal('latitude', 14, 10);
    table.decimal('longitude', 14, 10);
    table.decimal('altitude', 18, 10);
    table.string('tipo');
    table.boolean('ativo').notNullable().defaultTo(true);
    table.integer('pessoa_fisica_id').notNullable()
      .references('id').inTable('pessoa_fisica');
    table.integer('veiculo_id').notNullable()
      .references('id').inTable('veiculo');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('ativacao');
};
