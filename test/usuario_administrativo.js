'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../areaazul');
var BusinessException = AreaAzul.BusinessException;
var UsuarioAdministrativo = AreaAzul.models.UsuarioAdministrativo;
var PessoaFisica = AreaAzul.models.pessoafisica.PessoaFisica;

describe('models.UsuarioAdministrativo', function() {
  var cpfPreExistente = 'adm-teste-pre-existente';
  var cpfNaoExistente = 'adm-teste-nao-existente';
  var loginAdministrativoPreExistente = 'adm-pre-existente';
  var loginAdministrativoNaoExistente = 'adm-nao-existente';
  var senhaAdministrativoPreExistente = 'senha-adm-pre-existente';
  var idValido = null;

  function apagarDadosDeTeste() {
    return TestHelpers
      .apagarUsuarioAdministrativoPorLogin(loginAdministrativoPreExistente)
      .then(function() {
        return TestHelpers
          .apagarUsuarioAdministrativoPorLogin(loginAdministrativoNaoExistente);
      })
      .then(function() {
        return TestHelpers
          .apagarPessoaFisicaPorCPF(cpfPreExistente);
      })
      .then(function() {
        return TestHelpers
          .apagarPessoaFisicaPorCPF(cpfNaoExistente);
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

    it('cadastra usuario admin com cpf novo', function(done) {
      UsuarioAdministrativo.cadastrar({
        login: loginAdministrativoNaoExistente,
        nome: 'Administrativo Teste',
        email: 'adm-teste@example.com',
        cpf: cpfNaoExistente,
      })
      .then(function(p) {
        should.exist(p);
        idValido = p.id;
        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    it('cadastra usuario admin com cpf existente', function(done) {
      UsuarioAdministrativo.cadastrar({
        login: loginAdministrativoPreExistente,
        senha: senhaAdministrativoPreExistente,
        nome: 'Administrativo Teste',
        email: 'adm-teste@example.com',
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

  describe('buscaPorId()', function() {

    it('encontra id valido', function(done) {
      UsuarioAdministrativo
        .buscarPorId(idValido)
        .then(function(usuarioAdministrativo) {
          should.exist(usuarioAdministrativo);
          usuarioAdministrativo.should.have.property('id', idValido);
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });

    it('nao encontra id invalido', function(done) {
      UsuarioAdministrativo
        .buscarPorId(0)
        .then(function() {
          done(new Error('Nao deveria encontrar id=0'));
        })
        .catch(function(err) {
          should.exist(err);
          err.should.be.an.instanceof(BusinessException);
          err.should.have.property(
            'message',
            'UsuarioAdministrativo: id nao encontrado');
          done();
        });
    });

  });

  describe('autorizado()', function() {

    it('aceita credencial valida', function(done) {
      UsuarioAdministrativo.autorizado(
        loginAdministrativoPreExistente,
        senhaAdministrativoPreExistente)
        .then(function(usuarioAdministrativo) {
          should.exist(usuarioAdministrativo);
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });

    it('recusa credencial invalida', function(done) {
      UsuarioAdministrativo.autorizado(
        loginAdministrativoPreExistente,
        senhaAdministrativoPreExistente + '0')
        .then(function() {
          done('Nao deve aceitar senha errada');
        })
        .catch(function(err) {
          should.exist(err);
          err.should.be.an.instanceof(BusinessException);
          err.should.have.property(
            'message',
            'UsuarioAdministrativo: senha incorreta');
          done();
        });
    });

    it('recusa login invalido', function(done) {
      UsuarioAdministrativo.autorizado(
        loginAdministrativoPreExistente + '0',
        senhaAdministrativoPreExistente)
        .then(function() {
          done('Nao deve aceitar login errado');
        })
        .catch(function(err) {
          should.exist(err);
          err.should.be.an.instanceof(BusinessException);
          err.should.have.property(
            'message',
            'UsuarioAdministrativo: login invalido');
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
