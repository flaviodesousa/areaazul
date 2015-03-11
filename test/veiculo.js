var AreaAzul = require('../areaazul');
var should = require('should');
var Veiculo = AreaAzul.models.veiculo;

describe('model.veiculo', function() {
	describe('cadastrar()', function() {

		it('grava veiculo', function(done) {
			 var veiculo = {
	             estado_id: 1,
	             placa: 'bbc',
	             placa_numero: 1234,
	             marca: 'Chrsyler',
	             modelo: '300c',
	             cor: 'preto',
	             ano_fabricado: 2015,
	             ano_modelo: 2015,
	             usuario_id : 31
	        }
			Veiculo.cadastrar(veiculo,
				function(model) {
					done();
				},
				function(err) {
					done(err);
				});
		});
	});


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