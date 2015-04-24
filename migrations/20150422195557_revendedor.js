'use strict';

exports.up = function(knex, Promise) {
    return knex.schema
        .createTable('revendedor', function(table) {
            table.bigInteger('pessoa_id')
            	.primary()
            	.references('id_pessoa').inTable('pessoa');
            table.increments('id_revendedor').primary();
            table.boolean('ativo').notNullable();
        });
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('revendedor');
};
