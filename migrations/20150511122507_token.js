'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('token', function(table) {
    table.uuid('id').primary().notNullable();
    table.timestamp('data_expiracao').notNullable();
    table.enu('proposito',
      [
        'solicitacao_nova_senha',
        'confirmacao_nova_senha',
        'verificacao_de_email'
      ])
      .notNullable();
    table.integer('pessoa_fisica_id').notNullable()
      .references('id').inTable('pessoa_fisica');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('token');
};
