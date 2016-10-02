'use strict';

const should = require('chai').should();
const debug = require('debug')('areaazul:test:usuario_fiscal');
const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;

var UsuarioFiscal = Bookshelf.model('UsuarioFiscal');
var PessoaFisica = Bookshelf.model('PessoaFisica');

const TestHelpers = require('areaazul-test-helpers')(AreaAzul);

describe('models.UsuarioFiscal', function() {
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

    it('cadastra usuario fiscal com cpf novo', function(done) {
      UsuarioFiscal
        .cadastrar(camposUsuarioFiscalNaoExistente)
        .then(function(usuarioFiscal) {
          should.exist(usuarioFiscal);
          usuarioFiscal.get('login')
            .should.equal(camposUsuarioFiscalNaoExistente.login);
          // Salvar id para testes de buscarPorId()
          usuarioFiscalNaoExistente = usuarioFiscal;
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('cadastra usuario fiscal com cpf existente', function(done) {
      UsuarioFiscal
        .cadastrar(camposUsuarioFiscalPreExistente)
        .then(function(usuarioFiscal) {
          should.exist(usuarioFiscal);
          usuarioFiscal.get('login').should.equal(
            camposUsuarioFiscalPreExistente.login);
          return new PessoaFisica({ id: usuarioFiscal.id })
            .fetch();
        })
        .then(function(pessoaFisica) {
          should.exist(pessoaFisica);
          pessoaFisica.get('cpf').should.equal(
            camposUsuarioFiscalPreExistente.cpf);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
        });
    });

  });

  describe('buscaPorId()', function() {

    it('encontra id valido', function(done) {
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

    it('nao encontra id invalido', function(done) {
      UsuarioFiscal
        .buscarPorId(0)
        .then(function() {
          done(new Error('Nao deveria encontrar id=0'));
        })
        .catch(function(err) {
          should.exist(err);
          err.should.be.an.instanceof(AreaAzul.BusinessException);
          err.should.have.property(
            'message',
            'UsuarioFiscal: id nao encontrado');
          done();
        });
    });

  });

  describe('autorizado()', function() {

    it('aceita credencial valida', function(done) {
      UsuarioFiscal.autorizado(
        camposUsuarioFiscalPreExistente.login,
        camposUsuarioFiscalPreExistente.nova_senha)
        .then(function(usuarioFiscal) {
          should.exist(usuarioFiscal);
          usuarioFiscal.get('login')
            .should.equal(camposUsuarioFiscalPreExistente.login);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('recusa credencial invalida', function(done) {
      UsuarioFiscal.autorizado(
        camposUsuarioFiscalPreExistente.login,
        camposUsuarioFiscalPreExistente.nova_senha + '0')
        .then(function() {
          done(new Error('Nao deve aceitar senha errada'));
        })
        .catch(function(err) {
          should.exist(err);
          err.should.be.an.instanceof(AreaAzul.BusinessException);
          err.should.have.property(
            'message',
            'UsuarioFiscal: senha incorreta');
          done();
        });
    });

    it('recusa login invalido', function(done) {
      UsuarioFiscal
        .autorizado(
          camposUsuarioFiscalPreExistente.login + '0',
          camposUsuarioFiscalNaoExistente.nova_senha)
        .then(function() {
          done(new Error('Nao deve aceitar login errado'));
        })
        .catch(function(err) {
          should.exist(err);
          err.should.be.an.instanceof(AreaAzul.AuthenticationError);
          err.should.have.property(
            'message',
            'UsuarioFiscal: login invalido');
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
        debug('erro inesperado', e);
        done(e);
      });
  });
});
