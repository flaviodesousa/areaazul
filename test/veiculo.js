var AreaAzul = require('../areaazul');
var should = require('should');
var Veiculo = AreaAzul.models.veiculo;

describe('model.veiculo', function() {

	describe('Procurar()', function() {
		it('retorna um veiculo', function(done) {
			var v = { id_veiculo: 11}
			Veiculo.procurar(v,
				function(model) {
					model.should.not.empty;
					done();
				},
				function(err) {
					done(err);
				});
		});
	});
});