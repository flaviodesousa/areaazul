'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('token', function(table) {
    table.uuid('id_token').notNullable();
    table.timestamp('data_expiracao').notNullable();
    table.string('descricao');
    table.integer('pessoa_id').notNullable()
      .references('id_pessoa').inTable('pessoa');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('token');
};
