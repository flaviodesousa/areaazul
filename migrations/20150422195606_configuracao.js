'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.createTable('configuracao', function(table) {
        table.increments('id_configuracao').primary();
        table.bigInteger('tempo_limite_estacionamento').notNullable();
        table.bigInteger('tempo_maximo');
        table.bigInteger('tempo_tolerancia');
        table.decimal('valor_unitario');
        table.decimal('comissao_credenciado');
        table.decimal('comissao_revendedor');
        table.boolean('ativo').notNullable();
    });
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('configuracao');
};
