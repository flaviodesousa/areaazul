'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('ativacao', function(table) {
    table.increments('id').primary();
    table.timestamp('data_ativacao').notNullable();
    table.timestamp('validade').notNullable();
    table.timestamp('data_desativacao');
    table.decimal('latitude', 14, 10);
    table.decimal('longitude', 14, 10);
    table.decimal('altitude', 18, 10);
    table.string('tipo');
    table.integer('veiculo_id').notNullable()
      .references('id').inTable('veiculo');
  }).createTable('ativacao_usuario', function(table) {
    table.integer('ativacao_id').notNullable()
      .references('id').inTable('ativacao');
    table.integer('usuario_id').notNullable()
      .references('id').inTable('usuario');
    table.primary(['ativacao_id', 'usuario_id']);
  }).createTable('ativacao_usuario_revendedor', table => {
    table.integer('ativacao_id').notNullable()
      .references('id').inTable('ativacao');
    table.integer('usuario_revendedor_id').notNullable()
      .references('id').inTable('usuario_revendedor');
    table.primary(['ativacao_id', 'usuario_revendedor_id']);
  }).createTable('ativacao_usuario_fiscal', table => {
    table.integer('ativacao_id').notNullable()
      .references('id').inTable('ativacao');
    table.integer('usuario_fiscal_id').notNullable()
      .references('id').inTable('usuario_fiscal');
    table.primary(['ativacao_id', 'usuario_fiscal_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('ativacao_usuario_fiscal')
    .dropTableIfExists('ativacao_usuario_revendedor')
    .dropTableIfExists('ativacao_usuario')
    .dropTableIfExists('ativacao');
};
