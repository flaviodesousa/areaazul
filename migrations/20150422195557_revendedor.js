'use strict';

exports.up = function(knex, Promise) {
  return knex.schema
        .createTable('revendedor', function(table) {
          table.integer('pessoa_id')
            .primary()
            .references('id_pessoa').inTable('pessoa');
          table.boolean('ativo').notNullable().defaultTo(true);
        });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('revendedor');
};
