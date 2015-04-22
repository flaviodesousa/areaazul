'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.createTable('pessoa', function(table) {
        table.increments('id_pessoa').primary();
        table.string('nome').notNullable();
        table.string('email').notNullable();
        table.string('telefone');
        table.string('observacao');
        table.boolean('ativo').notNullable();
    });
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('pessoa');
};
