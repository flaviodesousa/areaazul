'use strict';

const debug = require('debug')('areaazul:test:revendedor');
const should = require('chai').should();

const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;

const Revendedor = Bookshelf.model('Revendedor');
const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');

const TestHelpers = require('areaazul-test-helpers')(AreaAzul);

describe('model.revendedor', function() {
  const revendedorPF = {
    nome: 'Nome PF Teste Revendedor',
    email: 'pf-teste-revendedor@areaazul.org',
    telefone: '000 0000-0000',
    cpf: '96818717748',
    data_nascimento: '31/10/1967',
    autorizacao: 'autorizacao',
    login: 'teste-revendedor-pf',
    nova_senha: 'senha-teste',
    conf_senha: 'senha-teste',
    termo_servico: 'Sim'
  };
  const revendedorPJ = {
    cnpj: '31604743000102',
    nome: 'Nome PJ Teste Revendedor',
    nome_fantasia: 'nome-fantasia-teste',
    razao_social: 'razao-social-teste',
    contato: 'contato-teste',
    email: 'teste-revendedor@areaazul.org',
    telefone: '000 0000-0000',
    cpf: '54800416493',
    login: 'teste-revendedor-pj',
    autorizacao: 'autorizacao teste',
    nova_senha: 'senha-teste',
    conf_senha: 'senha-teste',
    termo_servico: 'Sim'
  };

  function apagarRevendedoresDeTeste() {
    return TestHelpers
      .apagarRevendedorPorCPF(revendedorPF.cpf)
      .then(function() {
        return TestHelpers.apagarRevendedorPorCNPJ(revendedorPJ.cnpj);
      })
      .catch(function(e) {
        debug('erro inesperado', e);
        throw e;
      });
  }

  before(function() {
    debug('before');
    return apagarRevendedoresDeTeste();
  });

  describe('validarRevenda()', function() {
    it('Validar revendedor pessoa fisica funciona', function(done) {
      Revendedor.validarRevenda(revendedorPF)
        .then(function() {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('Validar revendedor pessoa juridica funciona', function(done) {
      Revendedor.validarRevenda(revendedorPJ)
        .then(function(mensagensRevendedorPJ) {
          should.exist(mensagensRevendedorPJ);
          mensagensRevendedorPJ.should.be.instanceOf(Array);
          mensagensRevendedorPJ.length.should.be.equal(0);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });


  describe('cadastrar()', function() {
    it('cadastrar pessoa fisica funciona', function(done) {
      Revendedor.cadastrar(revendedorPF)
        .then(function(revenda) {
          should.exist(revenda);
          return UsuarioRevendedor
            .procurarLogin(revendedorPF.login);
        })
        .then(function(urpf) {
          should.exist(urpf);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('cadastrar pessoa juridica funciona', function(done) {
      Revendedor.cadastrar(revendedorPJ)
        .then(function(revenda) {
          should.exist(revenda);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('buscarRevendedor()', function() {
    var idUsuarioRevenda = null;

    before(function() {
      const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
      return UsuarioRevendedor
        .procurarLogin(revendedorPJ.login)
        .then(function(usuarioRevenda) {
          idUsuarioRevenda = usuarioRevenda.get('pessoa_fisica_id');
        })
    });

    it('retorna um revendedor', function(done) {
      Revendedor
        .buscarRevendedor({ pessoa_fisica_id: idUsuarioRevenda })
        .then(function(revenda) {
          should.exist(revenda);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  after(function() {
    debug('after');
    return apagarRevendedoresDeTeste();
  });

});
