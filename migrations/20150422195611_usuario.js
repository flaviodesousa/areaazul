'use strict';

exports.up = function(knex, Promise) {
    knex.schema
        .createTable('usuario', function(table) {
            table.bigInteger('pessoa_id')
            	.primary()
            	.references('id_pessoa').inTable('pessoa_fisica');
            table.string('login').unique().notNullable();
            table.string('senha');
            table.integer('autorizacao').notNullable();
            table.boolean('primeiro_acesso').notNullable();
            table.boolean('ativo').notNullable()
            	;
        });
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('usuario');
};
