var Bookshelf = require('bookshelf').conexaoMain;

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
		fiscal_id: 1
	});
	fiscalizacao.save().then(function(model, err) {
		if (err) {
			fail(false);
		} else {
			then(true);
		}
	});
}

exports.listar = function(consulta_fiscalizacao_params, then, fail) {
	FiscalizacaoCollection.forge().query(function(qb) {
		qb.select('fiscalizacao.*')
	}).fetch().then(function(collection) {
		then(collection);
	})
}
