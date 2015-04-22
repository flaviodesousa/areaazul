'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.createTable('movimentacao_conta', function(table) {
        table.increments('id_movimentacao_conta').primary();
        table.timestamp('data_deposito').notNullable();
        table.timestamp('data_estorno');
        table.string('historico').notNullable();
        table.string('tipo').notNullable();
        table.decimal('valor').notNullable();
        table.boolean('ativo').notNullable();
        table.bigInteger('conta_id').notNullable()
        	.references('id_conta').inTable('conta');
        table.bigInteger('pessoa_id').notNullable()
        	.references('id_pessoa').inTable('pessoa');
    });
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('movimentacao_conta');
};
