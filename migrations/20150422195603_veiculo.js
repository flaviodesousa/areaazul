'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.createTable('veiculo', function(table) {
        table.increments('id_veiculo').primary();
        table.string('placa').unique().notNullable();
        table.string('marca');
        table.string('modelo');
        table.string('cor');
        table.bigInteger('ano_fabricado');
        table.bigInteger('ano_modelo');
        table.boolean('ativo');
        table.bigInteger('estado_id')
        	.references('id_estado').inTable('estado');
    });
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('veiculo');
};
