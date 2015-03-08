var AreaAzul = require('../areaazul');
var should = require('should');
var Fiscalizacao = AreaAzul.models.fiscalizacao;

describe('model.fiscalizacao', function() {
	describe('cadastrar()', function() {
		it('nao grava sem placa', function(done) {
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
	describe('listar()', function() {
		it('retorna uma lista de fiscalizacoes', function(done) {
			Fiscalizacao.listar(undefined,
				function(collection) {
					collection.toJSON({shallow: true})
						.should.be.Array
						.and.not.empty;
					done();
				},
				function(err) {
					done(err);
				});
		});
	});
});