var AreaAzul = require('../areaazul');
var should = require('should');
var Usuario = AreaAzul.models.usuario;
/*
describe('model.usuario', function() {

	describe('validade()', function() {
		it('valida usuario', function(done) {
		   var usuario = {
		        nome: '',
                email: 'sirline',
                telefone: '',
                cpf: '7507584913',
                data_nascimento: '02/02/2002',
                sexo: ''
    		}

			Usuario.validate(usuario);
		});
	
	});
	/*it('grava usuario', function(done) {
	 	   var usuario = {
		        nome: '',
                email: 'sirline',
                telefone: '',
                cpf: '7507584913',
                data_nascimento: '02/02/2002',
                sexo: ''
    		}

		Usuario.cadastrar(usuario,
			function(model) {
				done('Should not have saved!')
			},
			function(err) {
				done();
			});
	});
	describe('listar()', function() {
		it('retorna uma lista de usuarios', function(done) {
			Usuario.listar(function(collection) {
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

	describe('alterarSenha()', function() {
		it('altera senha dos usuarios', function(done) {
	    var usuario = {
                id_usuario: 52,
                login: "26316010257",
                senha: "123454",
                nova_senha:"123454",
                conf_senha:"123454"
        }



		Usuario.alterarSenha(usuario,
			function(model) {
				console.log("passei aq");
				done()
			},
			function(err) {
				console.log("passei aq erro");
				done();
			});


		});
	});
	
});
*/