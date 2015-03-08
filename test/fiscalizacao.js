var AreaAzul = require('../areaazul')
var Fiscalizacao = AreaAzul.models.fiscalizacao;

describe('model.fiscalizacao', function() {
	describe('cadastrar()', function() {
		it('requer placa', function(done) {
			var f = {
				latitude: 33,
				longitude: 44
			};
			Fiscalizacao.cadastrar(f,
				function(model) {
					done('Should not have saved!')
				},
				function(err) {
					done();
				});
		});
		it('grava com placa', function(done) {
			var f = {
				placa: 'xyz1234',
				latitude: 33,
				longitude: 34
			};
			Fiscalizacao.cadastrar(f,
				function(model) {
					done();
				},
				function(err) {
					done(err);
				});
		});
	});
});