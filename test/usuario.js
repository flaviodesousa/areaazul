'use strict';

var should = require('should');
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../areaazul');
var Usuario = AreaAzul.models.usuario.Usuario;

describe('model.usuario', function() {
  var loginDeTeste = 'login-teste-unitario';

  function apagarDadosDeTeste() {
    return TestHelpers.apagarUsuarioPorLogin(loginDeTeste);
  }

  before(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        done();
      })
      .catch(function(e) {
        done(e);
      });
  });

  after(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        done();
      })
      .catch(function(e) {
        done(e);
      });
  });

  describe('validade()', function() {
    it.skip('valida usuario', function(done) {
      var usuario = {
        nome: '',
        email: 'sirline',
        telefone: '',
        cpf: '7507584913',
        data_nascimento: '02/02/2002',
        sexo: '',
      };

      var messages = Usuario.validate(usuario);
      should.exist(messages);
      done();
    });

  });

  it('grava usuario', function(done) {
    var usuario = {
      login: loginDeTeste,
      senha: 'senha-teste-unitario',
      nome: 'usuario teste unitario',
      email: 'teste-unitario@areaazul.org',
      telefone: '0',
      cpf: '0',
      data_nascimento: new Date(1981, 4, 1),
      sexo: 'feminino',
    };

    Usuario
      .cadastrar(usuario)
      .then(function() {
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  describe('listar()', function() {
    it.skip('retorna uma lista de usuarios', function(done) {
      Usuario.listar(function(collection) {
          collection.toJSON({shallow: true})
            .should.be.Array
            .and.not.empty();
          done();
        },
        function(err) {
          done(err);
        });
    });
  });

  describe('alterarSenha()', function() {
    it.skip('altera senha dos usuarios', function(done) {
      var usuario = {
        login: loginDeTeste,
        senha: '123454',
        nova_senha: '123454',
        conf_senha: '123454',
      };

      Usuario.alterarSenha(usuario,
      function() {
        console.log('passei aq');
        done();
      },
      function(err) {
        console.log('passei aq erro');
        done(err);
      });


    });
  });

});
