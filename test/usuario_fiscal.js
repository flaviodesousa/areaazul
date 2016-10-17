'use strict';

const should = require('chai').should();
const debug = require('debug')('areaazul:test:usuario_fiscal');

const AreaAzul = require('../areaazul');
const UsuarioFiscal = AreaAzul.facade.UsuarioFiscal;
const PessoaFisica = AreaAzul.facade.PessoaFisica;

const Bookshelf = require('../database');
const TestHelpers = require('areaazul-test-helpers')(AreaAzul, Bookshelf);

describe('facade UsuarioFiscal', function() {
  const camposUsuarioFiscalPreExistente = {
    login: 'login-ufpe-teste-unitario',
    nova_senha: 'senha-ufpe-teste-unitario-usuario',
    conf_senha: 'senha-ufpe-teste-unitario-usuario',
    nome: 'Teste Unitário Usuário Fiscal Pre Existente',
    email: 'teste-unitario-ufpe@areaazul.org',
    telefone: '00 0000 0000',
    cpf: '21985030268',
    data_nascimento: '13/04/1980',
    sexo: 'feminino'
  };
  const camposUsuarioFiscalNaoExistente = {
    login: 'login-ufne-teste-unitario',
    nova_senha: 'senha-ufne-teste-unitario-usuario',
    conf_senha: 'senha-ufne-teste-unitario-usuario',
    nome: 'Teste Unitário Usuário Fiscal Não Existente',
    email: 'teste-unitario-ufne@areaazul.org',
    telefone: '00 0000 0000',
    cpf: '99017383429',
    data_nascimento: '14/04/1980',
    sexo: 'feminino'
  };
  var usuarioFiscalNaoExistente;

  function apagarDadosDeTeste() {
    return TestHelpers
      .apagarUsuarioFiscalPorCPF(
        camposUsuarioFiscalPreExistente.cpf)
      .then(function() {
        return TestHelpers
          .apagarUsuarioFiscalPorCPF(
            camposUsuarioFiscalNaoExistente.cpf);
      })
      .then(function() {
        return TestHelpers
          .apagarPessoaFisicaPorCPF(
            camposUsuarioFiscalPreExistente.cpf);
      })
      .then(function() {
        return TestHelpers
          .apagarPessoaFisicaPorCPF(
            camposUsuarioFiscalNaoExistente.cpf);
      });
  }

  before(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        return PessoaFisica.cadastrar(camposUsuarioFiscalPreExistente);
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

    it('cadastra usuário fiscal com cpf novo', function(done) {
      UsuarioFiscal
        .cadastrar(camposUsuarioFiscalNaoExistente)
        .then(function(usuarioFiscal) {
          should.exist(usuarioFiscal);
          usuarioFiscal.should.have.property('id');
          usuarioFiscal.should.have.property(
            'login', camposUsuarioFiscalNaoExistente.login);
          usuarioFiscal.should.have.property('pessoaFisica');
          usuarioFiscal.pessoaFisica.should.have.property('pessoa');
          usuarioFiscal.pessoaFisica.should.have.property(
            'cpf', camposUsuarioFiscalNaoExistente.cpf);
          // Salvar id para testes de buscarPorId()
          usuarioFiscalNaoExistente = usuarioFiscal;
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('cadastra usuário fiscal com cpf existente', function(done) {
      UsuarioFiscal
        .cadastrar(camposUsuarioFiscalPreExistente)
        .then(function(usuarioFiscal) {
          should.exist(usuarioFiscal);
          usuarioFiscal.should.have.property('id');
          usuarioFiscal.should.have.property(
            'login', camposUsuarioFiscalPreExistente.login);
          usuarioFiscal.should.have.property('pessoaFisica');
          usuarioFiscal.pessoaFisica.should.have.property('pessoa');
          usuarioFiscal.pessoaFisica.should.have.property(
            'cpf', camposUsuarioFiscalPreExistente.cpf);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
        });
    });

  });

  describe('buscaPorId()', function() {

    it('encontra id válido', function(done) {
      UsuarioFiscal
        .buscarPorId(usuarioFiscalNaoExistente.id)
        .then(function(p) {
          should.exist(p);
          p.should.have.property('id', usuarioFiscalNaoExistente.id);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('não encontra id inválido', function(done) {
      UsuarioFiscal
        .buscarPorId(0)
        .then(function() {
          done(new Error('Não deveria encontrar id=0'));
        })
        .catch(function(err) {
          should.exist(err);
          err.should.be.an.instanceof(AreaAzul.BusinessException);
          err.should.have.property(
            'message',
            'Usuário fiscal: id não encontrado');
          done();
        });
    });

  });

  describe('autorizado()', function() {

    it('aceita credencial válida', function(done) {
      UsuarioFiscal.autorizado(
        camposUsuarioFiscalPreExistente.login,
        camposUsuarioFiscalPreExistente.nova_senha)
        .then(function(usuarioFiscal) {
          should.exist(usuarioFiscal);
          usuarioFiscal.should.have.property('id');
          usuarioFiscal.should.have.property(
            'login', camposUsuarioFiscalPreExistente.login);
          usuarioFiscal.should.have.property('pessoaFisica');
          usuarioFiscal.pessoaFisica.should.have.property('pessoa');
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('recusa credencial inválida', function(done) {
      UsuarioFiscal.autorizado(
        camposUsuarioFiscalPreExistente.login,
        camposUsuarioFiscalPreExistente.nova_senha + '0')
        .then(function() {
          done(new Error('Não deve aceitar senha errada'));
        })
        .catch(AreaAzul.AuthenticationError, function(err) {
          should.exist(err);
          err.should.be.an.instanceof(AreaAzul.AuthenticationError);
          err.should.have.property(
            'message',
            'Usuário fiscal: senha incorreta');
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('recusa login inválido', function(done) {
      UsuarioFiscal
        .autorizado(
          camposUsuarioFiscalPreExistente.login + '0',
          camposUsuarioFiscalNaoExistente.nova_senha)
        .then(function() {
          done(new Error('Não deve aceitar login errado'));
        })
        .catch(AreaAzul.AuthenticationError, function(err) {
          should.exist(err);
          err.should.be.an.instanceof(AreaAzul.AuthenticationError);
          err.should.have.property(
            'message',
            'Usuário fiscal: login inválido');
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
