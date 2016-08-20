'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('token', function(table) {
    table.uuid('id').notNullable();
    table.timestamp('data_expiracao').notNullable();
    table.string('proposito').notNullable();
    table.integer('pessoa_id').notNullable()
      .references('id').inTable('pessoa');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('token');
};
