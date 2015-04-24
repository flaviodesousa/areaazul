var Bookshelf = require('bookshelf').conexaoMain;
var moment = require('moment');

var Fiscalizacao = Bookshelf.Model.extend({
    tableName: 'fiscalizacao',
    idAttribute: 'id_fiscalizacao'
});

exports.Fiscalizacao = Fiscalizacao;

var FiscalizacaoCollection = Bookshelf.Collection.extend({
	model: Fiscalizacao
});

exports.cadastrar = function(fiscalizacao_params, then, fail) {
	var fiscalizacao = new this.Fiscalizacao({
		placa: fiscalizacao_params.placa,
		latitude: fiscalizacao_params.latitude,
		longitude: fiscalizacao_params.longitude,
		timestamp: new Date(),
		fiscal_id: fiscalizacao_params.fiscal_id
	});
	fiscalizacao.save().then(function(model) {
		then(model);
	}).catch(function(err) {
		fail(err);
	});
}

exports.listar = function(consulta_fiscalizacao_params, then, fail) {
	FiscalizacaoCollection
		.query('where', 'timestamp', '>=', moment().subtract(2, 'hours').calendar())
		.fetch()
		.then(function(c) {
			then(c);
		}).catch(function(err) {
			fail(err);
		});
}
