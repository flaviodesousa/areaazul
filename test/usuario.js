'use strict';

var debug = require('debug')('areaazul:test:usuario');
var should = require('chai').should();

const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;

var Usuario = Bookshelf.model('Usuario');

const TestHelpers = require('areaazul-test-helpers')(AreaAzul);

describe('model.usuario', function() {
  const camposUsuarioDeTeste = {
    login: 'login-teste-unitario-usuario',
    nova_senha: 'senha-teste-unitario-usuario',
    conf_senha: 'senha-teste-unitario-usuario',
    nome: 'Teste Unitário Usuário',
    email: 'teste-unitario-usuario@areaazul.org',
    telefone: '00 0000 0000',
    cpf: '32807868193',
    data_nascimento: '10/04/1980',
    sexo: 'feminino'
  };
  var usuarioDeTeste = null;

  function apagarDadosDeTeste() {
    return TestHelpers.apagarUsuarioPorLogin(camposUsuarioDeTeste.login);
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

  describe('validade()', function() {
    it('valida usuario', function(done) {
      Usuario
        ._camposValidos(camposUsuarioDeTeste, null, {})
        .then(function(messages) {
          should.exist(messages);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

  });

  describe('cadastrar()', function() {
    it('grava usuario', function(done) {
      Usuario
        .inserir(camposUsuarioDeTeste)
        .then(function(usuario) {
          usuarioDeTeste = usuario;
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
        camposUsuarioDeTeste.login,
        camposUsuarioDeTeste.nova_senha)
        .then(function(usuario) {
          should.exist(usuario);
          usuario.get('login').should.equal(camposUsuarioDeTeste.login);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('recusa credencial invalida', function(done) {
      Usuario.autorizado(
        camposUsuarioDeTeste.login,
        camposUsuarioDeTeste.nova_senha + '0')
        .then(function() {
          done(new Error('Nao deve aceitar senha errada'));
        })
        .catch(function(err) {
          should.exist(err);
          err.should.be.an.instanceOf(AreaAzul.AuthenticationError);
          done();
        });
    });

    it('recusa login invalido', function(done) {
      Usuario.autorizado(
        camposUsuarioDeTeste.login + '0',
        camposUsuarioDeTeste.nova_senha)
        .then(function() {
          done(new Error('Nao deve aceitar login errado'));
        })
        .catch(function(err) {
          should.exist(err);
          err.should.be.an.instanceOf(AreaAzul.BusinessException);
          done();
        });
    });
  });

  describe('alterarSenha()', function() {
    it('altera senha dos usuarios', function(done) {
      if (!usuarioDeTeste) {
        done(new Error('Sem usuário corrente'));
      }
      const usuarioTrocaSenha = {
        id: usuarioDeTeste.id,
        login: camposUsuarioDeTeste.login,
        senha: camposUsuarioDeTeste.nova_senha,
        nova_senha: camposUsuarioDeTeste.nova_senha + '0',
        conf_senha: camposUsuarioDeTeste.nova_senha + '0'
      };
      Usuario.alterarSenha(usuarioTrocaSenha)
        .then(function() {
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });

});
