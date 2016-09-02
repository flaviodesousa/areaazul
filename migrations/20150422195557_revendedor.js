'use strict';

exports.up = function(knex) {
  return knex.schema
        .createTable('revendedor', function(table) {
          table.integer('id')
            .primary()
            .references('id').inTable('pessoa');
          table.integer('conta_id').notNullable()
            .references('id').inTable('conta');
        });
};

exports.down = function(knex) {
  return knex.schema.dropTable('revendedor');
};
