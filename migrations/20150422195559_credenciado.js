'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.createTable('credenciado', function(table) {
        table.bigInteger('pessoa_id')
        	.primary()
        	.references('id_pessoa').inTable('pessoa');
        table.boolean('contrato_de_servico_valido');
        table.boolean('inadiplente');
        table.boolean('ativo').notNullable();
    });
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('credenciado');
};
