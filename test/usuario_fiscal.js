'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../../areaazul');
var UsuarioFiscal = AreaAzul.models.UsuarioFiscal;
var PessoaFisica = AreaAzul.models.pessoafisica.PessoaFisica;

describe('models.UsuarioFiscal', function() {
  var cpfPreExistente = 'fiscal-teste-pre-existente';
  var cpfNaoExistente = 'fiscal-teste-nao-existente';
  var loginFiscalPreExistente = 'fiscal-pre-existente';
  var loginFiscalNaoExistente = 'fiscal-nao-existente';
  var senhaFiscalPreExistente = 'senha-fiscal-pre-existente';

  function apagarDadosDeTeste() {
    return TestHelpers.apagarUsuarioFiscalPorCPF(cpfPreExistente)
      .then(function() {
        return TestHelpers.apagarUsuarioFiscalPorCPF(cpfNaoExistente);
      });
  }

  before(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        return PessoaFisica.cadastrar({
          nome: 'PF preexistente',
          email: 'preexistente@example.com',
          cpf: cpfPreExistente,
        });
      })
      .then(function() {
        done();
      })
      .catch(function(e) {
        done(e);
      });
  });

  describe('cadastrar()', function() {

    it('cadastra fiscal com cpf novo', function(done) {
      UsuarioFiscal.cadastrar({
        login: loginFiscalNaoExistente,
        nome: 'Fiscal Teste',
        email: 'fiscal-teste@example.com',
        cpf: cpfNaoExistente,
      })
      .then(function(pessoa) {
        should.exist(pessoa);
        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('cadastra fiscal com cpf existente', function(done) {
      UsuarioFiscal.cadastrar({
        login: loginFiscalPreExistente,
        senha: senhaFiscalPreExistente,
        nome: 'Fiscal Teste',
        email: 'fiscal-teste@example.com',
        cpf: cpfPreExistente,
      })
      .then(function(pessoa) {
        should.exist(pessoa);
        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

  });

  describe('autorizado()', function() {

    it('aceita credencial valida', function(done) {
      UsuarioFiscal.autorizado(
        loginFiscalPreExistente,
        senhaFiscalPreExistente)
        .then(function(usuarioFiscal) {
          should.exist(usuarioFiscal);
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });

    it('recusa credencial invalida', function(done) {
      UsuarioFiscal.autorizado(
        loginFiscalPreExistente,
        senhaFiscalPreExistente + '0')
        .then(function() {
          done('Nao deve aceitar senha errada');
        })
        .catch(function(err) {
          should.exist(err);
          should.exist(err.authentication_event);
          err.authentication_event.should.be.true;
          done();
        });
    });

    it('recusa login invalido', function(done) {
      UsuarioFiscal.autorizado(
        loginFiscalPreExistente + '0',
        senhaFiscalPreExistente)
        .then(function() {
          done('Nao deve aceitar login errado');
        })
        .catch(function(err) {
          should.exist(err);
          should.exist(err.authentication_event);
          err.authentication_event.should.be.true;
          done();
        });
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
});
