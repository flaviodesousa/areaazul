'use strict';

exports.up = function(knex, Promise) {
    knex.schema
        .createTable('usuario_administrativo', function(table) {
            table.bigInteger('pessoa_fisica_pessoa_id')
            	.primary()
            	.references('pessoa_id').inTable('pessoa_fisica');
            table.string('login').unique().notNullable();
            table.string('senha');
            table.boolean('primeiro_acesso').notNullable();
            table.boolean('ativo').notNullable();
        });
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('usuario_administrativo');
};
