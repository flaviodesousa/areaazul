'use strict';

exports.up = function(knex, Promise) {
      return knex.schema.createTable('recupera_senha', function(table) {
        table.bigInteger('id_recupera_senha').notNullable();
        table.timestamp('data_expiracao').notNullable();
        table.bigInteger('pessoa_id').notNullable().references('id_pessoa').inTable('pessoa');
    });
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('recupera_senha');
};
