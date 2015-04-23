'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.createTable('usuario', function(table) {
        table.bigInteger('pessoa_id')
            .primary()
            .references('pessoa_id').inTable('pessoa_fisica');
        table.string('login').unique().notNullable();
        table.string('senha');
        table.integer('autorizacao').notNullable();
        table.boolean('primeiro_acesso').notNullable();
        table.boolean('ativo').notNullable().defaultTo(true);
    });
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('usuario');
};
