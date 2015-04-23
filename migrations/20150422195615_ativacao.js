'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.createTable('ativacao', function(table){
        table.increments('id_ativacao').primary();
        table.timestamp('data_ativacao').notNullable();
        table.decimal('latitude', 14, 10);
        table.decimal('longitude', 14, 10);
        table.decimal('altitude', 18, 10);
        table.boolean('ativo').notNullable();
        table.bigInteger('usuario_pessoa_id').notNullable()
            .references('pessoa_id').inTable('usuario');
        table.bigInteger('veiculo_id').notNullable()
        	.references('id_veiculo').inTable('veiculo');
    });
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('ativacao');
};
