'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.createTable('bairro', function(table) {
        table.increments('id_bairro').primary();
        table.string('nome').notNullable();
        table.boolean('ativo').notNullable();
        table.bigInteger('cidade_id').notNullable().references('id_cidade').inTable('cidade');
    });
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('bairro');
};
