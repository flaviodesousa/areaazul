'use strict';

var debug = require('debug')('areaazul:test:usuario');
var should = require('chai').should();
var AreaAzul = require('../areaazul');
var TestHelpers = require('../helpers/test');
var Bookshelf = require('bookshelf').conexaoMain;
var Usuario = Bookshelf.model('Usuario');

describe('model.usuario', function() {
  var loginDeTeste = 'login-teste-unitario';
  var senhaDeTeste = 'senha-teste-unitario';

  function apagarDadosDeTeste() {
    return TestHelpers.apagarUsuarioPorLogin(loginDeTeste);
  }

  before(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        done();
      })
      .catch(function(e) {
        debug('erro inesperado em before()', e);
        done(e);
      });
  });

  after(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        done();
      })
      .catch(function(e) {
        debug('erro inesperado em after()', e);
        done(e);
      });
  });

  describe('cadastrar()', function() {
    it('grava usuario', function(done) {
      var usuario = {
        login: loginDeTeste,
        senha: senhaDeTeste,
        nome: 'usuario teste unitario',
        email: 'teste-unitario@areaazul.org',
        telefone: '0',
        cpf: '32807868193',
        data_nascimento: '11/04/1980',
        sexo: 'feminino'
      };

      Usuario
        .inserir(usuario)
        .then(function() {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('autorizado()', function() {
    it('aceita credenciais validas', function(done) {
      Usuario.autorizado(
        loginDeTeste,
        senhaDeTeste)
        .then(function(usuarioFiscal) {
          should.exist(usuarioFiscal);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('recusa credencial invalida', function(done) {
      Usuario.autorizado(
        loginDeTeste,
        senhaDeTeste + '0')
        .then(function() {
          done('Nao deve aceitar senha errada');
        })
        .catch(function(err) {
          should.exist(err);
          should.exist(err.authentication_event);
          err.authentication_event.should.equal(true);
          done();
        });
    });

    it('recusa login invalido', function(done) {
      Usuario.autorizado(
        loginDeTeste + '0',
        senhaDeTeste)
        .then(function() {
          done('Nao deve aceitar login errado');
        })
        .catch(function(err) {
          should.exist(err);
          should.exist(err.authentication_event);
          err.authentication_event.should.equal(true);
          done();
        });
    });
  });

  describe('validade()', function() {
    it.skip('valida usuario', function(done) {
      var usuario = {
        nome: 'teste',
        email: 'sirline',
        telefone: '06220000000',
        cpf: '75075849172',
        data_nascimento: '02/02/2002',
        sexo: ''
      };

      var messages = Usuario.validate(usuario);
      should.exist(messages);
      done();
    });

  });

  describe('listar()', function() {
    it.skip('retorna uma lista de usuarios', function(done) {
      Usuario.listar(function(collection) {
          collection.toJSON({shallow: true})
            .should.be.an('Array')
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
        conf_senha: '123454'
      };

      Usuario.alterarSenha(usuario,
      function() {
        done();
      },
      function(err) {
        done(err);
      });


    });
  });

});
