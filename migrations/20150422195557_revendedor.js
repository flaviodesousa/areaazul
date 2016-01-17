'use strict';

exports.up = function(knex) {
  return knex.schema
        .createTable('revendedor', function(table) {
          table.integer('pessoa_id')
            .primary()
            .references('id_pessoa').inTable('pessoa');
          table.boolean('ativo').notNullable().defaultTo(true);
        });
};

exports.down = function(knex) {
  return knex.schema.dropTable('revendedor');
};
