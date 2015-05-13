'use strict';

exports.up = function(knex, Promise) {
      return knex.schema.createTable('recuperacao_senha', function(table) {
        table.uuid('id_recuperacao_senha').notNullable();
        table.timestamp('data_expiracao').notNullable();
        table.bigInteger('pessoa_id').notNullable().references('id_pessoa').inTable('pessoa');
    });
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('recuperacao_senha');
};
