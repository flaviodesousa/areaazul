'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('fiscalizacao', function(table) {
    table.increments('id_fiscalizacao').primary();
    table.string('placa').notNullable();
    table.integer('veiculo_id').nullable()
      .references('id_veiculo').inTable('veiculo');
    table.timestamp('timestamp').notNullable();
    table.integer('fiscal_id').notNullable()
      .references('pessoa_id').inTable('usuario_fiscal');
    table.decimal('latitude', 14, 10);
    table.decimal('longitude', 14, 10);
    table.decimal('altitude', 18, 10);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('fiscalizacao');
};
