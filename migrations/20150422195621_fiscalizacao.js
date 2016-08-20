'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('fiscalizacao', function(table) {
    table.increments('id').primary();
    table.string('placa').notNullable();
    table.integer('veiculo_id').nullable()
      .references('id').inTable('veiculo');
    table.timestamp('timestamp').notNullable();
    table.integer('usuario_fiscal_id').notNullable()
      .references('id').inTable('usuario_fiscal');
    table.decimal('latitude', 14, 10);
    table.decimal('longitude', 14, 10);
    table.decimal('altitude', 18, 10);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('fiscalizacao');
};
