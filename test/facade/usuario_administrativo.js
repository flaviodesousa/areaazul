'use strict';

const should = require('chai')
  .should();
const debug = require('debug')('areaazul:test:usuario_administrativo');
const Promise = require('bluebird');

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul._internals.Bookshelf;
const UsuarioAdministrativo = AreaAzul.facade.UsuarioAdministrativo;
const PessoaFisica = AreaAzul.facade.PessoaFisica;

const TestHelpers = require('../../test-helpers')(AreaAzul);

describe('facade UsuarioAdministrativo', function() {
  const camposUsuarioAdministrativoPreExistente = {
    login: 'login-uape-teste-unitario',
    nova_senha: 'senha-uape-teste-unitario-usuario',
    conf_senha: 'senha-uape-teste-unitario-usuario',
    nome: 'Teste Unitário Usuário Administrativo Pre Existente',
    email: 'teste-unitario-uape@areaazul.org',
    telefone: '00 0000 0000',
    cpf: '22791251618',
    data_nascimento: '11/04/1980',
    sexo: 'feminino'
  };
  const camposUsuarioAdministrativoNaoExistente = {
    login: 'login-uane-teste-unitario',
    nova_senha: 'senha-uane-teste-unitario-usuario',
    conf_senha: 'senha-uane-teste-unitario-usuario',
    nome: 'Teste Unitário Usuário Administrativo Não Existente',
    email: 'teste-unitario-uane@areaazul.org',
    telefone: '00 0000 0000',
    cpf: '59588607396',
    data_nascimento: '12/04/1980',
    sexo: 'feminino'
  };
  let usuarioAdministrativoNaoExistente;

  function apagarDadosDeTeste() {
    return Bookshelf.transaction(trx => Promise.all([
      TestHelpers.apagarUsuarioAdministrativoPorLogin(camposUsuarioAdministrativoPreExistente.login, trx),
      TestHelpers.apagarUsuarioAdministrativoPorLogin(camposUsuarioAdministrativoNaoExistente.login, trx),
      TestHelpers.apagarPessoaFisicaPorCPF(camposUsuarioAdministrativoPreExistente.cpf, trx),
      TestHelpers.apagarPessoaFisicaPorCPF(camposUsuarioAdministrativoNaoExistente.cpf, trx)
    ]));
  }

  before(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        return PessoaFisica.cadastrar(camposUsuarioAdministrativoPreExistente);
      })
      .then(function() {
        done();
      })
      .catch(function(e) {
        debug('erro inesperado', e);
        done(e);
      });
  });

  describe('cadastrar()', function() {

    it('cadastra usuário admin com cpf novo', function(done) {
      UsuarioAdministrativo
        .cadastrar(camposUsuarioAdministrativoNaoExistente)
        .then(function(usuAdm) {
          should.exist(usuAdm);
          usuAdm.should.have.property(
            'login', camposUsuarioAdministrativoNaoExistente.login);
          // Salvar id para testes de buscarPorId()
          usuarioAdministrativoNaoExistente = usuAdm;
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('cadastra usuário admin com cpf existente', function(done) {
      UsuarioAdministrativo
        .cadastrar(camposUsuarioAdministrativoPreExistente)
        .then(function(usuAdm) {
          should.exist(usuAdm);
          usuAdm.should.have.property(
            'login', camposUsuarioAdministrativoPreExistente.login);
          usuAdm.should.have.property('pessoaFisica');
          usuAdm.pessoaFisica.should.have.property(
            'cpf', camposUsuarioAdministrativoPreExistente.cpf);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

  });

  describe('buscaPorId()', function() {

    it('encontra id válido', function(done) {
      UsuarioAdministrativo
        .buscarPorId(usuarioAdministrativoNaoExistente.id)
        .then(function(usuAdm) {
          should.exist(usuAdm);
          usuAdm.should.have.property(
            'id', usuarioAdministrativoNaoExistente.id);
          usuAdm.should.have.property(
            'login', camposUsuarioAdministrativoNaoExistente.login);
          usuAdm.should.have.property('pessoaFisica');
          usuAdm.pessoaFisica.should.have.property(
            'cpf', camposUsuarioAdministrativoNaoExistente.cpf);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('não encontra id inválido', function(done) {
      UsuarioAdministrativo
        .buscarPorId(0)
        .then(function() {
          done(new Error('Nao deveria encontrar id=0'));
        })
        .catch(function(err) {
          should.exist(err);
          err.should.be.an.instanceof(AreaAzul.BusinessException);
          err.should.have.property(
            'message',
            'Usuario administrativo: id não encontrado');
          done();
        });
    });

  });

  describe('autentico()', function() {

    it('aceita credencial válida', function(done) {
      UsuarioAdministrativo.autentico(
        camposUsuarioAdministrativoPreExistente.login,
        camposUsuarioAdministrativoPreExistente.nova_senha)
        .then(function(usuAdm) {
          should.exist(usuAdm);
          usuAdm.should.have.property(
            'login', camposUsuarioAdministrativoPreExistente.login);
          usuAdm.should.have.property('pessoaFisica');
          usuAdm.pessoaFisica.should.have.property(
            'cpf', camposUsuarioAdministrativoPreExistente.cpf);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('recusa credencial inválida', function(done) {
      UsuarioAdministrativo.autentico(
        camposUsuarioAdministrativoPreExistente.login,
        camposUsuarioAdministrativoPreExistente.nova_senha + '0')
        .then(function() {
          done(new Error('Não deve aceitar senha errada'));
        })
        .catch(AreaAzul.AuthenticationError, function(err) {
          should.exist(err);
          err.should.be.an.instanceof(AreaAzul.AuthenticationError);
          err.should.have.property(
            'message',
            'Usuário administrativo: senha incorreta');
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('recusa login inválido', function(done) {
      UsuarioAdministrativo
        .autentico(
          camposUsuarioAdministrativoPreExistente.login + '0',
          camposUsuarioAdministrativoNaoExistente.nova_senha)
        .then(function() {
          done(new Error('Não deve aceitar login errado'));
        })
        .catch(AreaAzul.AuthenticationError, function(err) {
          should.exist(err);
          err.should.be.an.instanceof(AreaAzul.AuthenticationError);
          err.should.have.property(
            'message',
            'Usuário administrativo: login inválido');
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

  });

  after(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        done();
      })
      .catch(function(e) {
        debug('erro inesperado', e);
        done(e);
      });
  });
});
