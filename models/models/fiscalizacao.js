var Bookshelf = require('bookshelf').conexaoMain;
var moment = require('moment');

module.exports = Bookshelf.Model.extend({
  tableName: 'fiscalizacao',
  idAttribute: 'id_fiscalizacao'
}, {
	cadastrar: function (params, then, fail) {
		this
		.forge({
			placa: params.placa,
			latitude: params.latitude,
			longitude: params.longitude,
			timestamp: new Date(),
			fiscal_id: params.fiscal_id
		})
		.save()
		.then(function(model) {
			then(model);
		})
		.catch(function(err) {
			fail(err);
		});
	}
});
