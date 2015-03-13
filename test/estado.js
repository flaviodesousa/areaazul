var AreaAzul = require('../areaazul');
var should = require('should');
var Estado = AreaAzul.models.estado;

describe('model.estado', function() {

	describe('cadastrar()', function() {
		it('nao grava com nomes iguais', function(done) {
		   var estado = {
		        nome: 'ACRE',
       			uf: 'AC'
    		}

			Estado.cadastrar(estado,
				function(model) {
					console.log("Deu certo");
					done("Should not have saved!")
				},
				function(err) {
					console.log("Deu erro");
					done();
				});
		});
		it('nao grava sem nome de estado', function(done) {
		   var estado = {
       			uf: 'AC'
    		}

			Estado.cadastrar(estado,
				function(model) {
					console.log("Deu certo");
					done("Should not have saved!")
				},
				function(err) {
					console.log("Deu erro");
					done();
				});
		});
		it('nao grava com nome já cadastrado', function(done) {
		   var estado = {
		        nome: 'TOCANTINS',
       			uf: 'TO'
    		}

			Estado.cadastrar(estado,
				function(model) {
					console.log("Deu certo");
					done('')
				},
				function(err) {
					console.log("Deu erro");
					done();
				});
		});


	});
	
});