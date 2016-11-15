'use strict';

const debug = require('debug')('areaazul:test:revendedor');
const should = require('chai').should();

const AreaAzul = require('../areaazul');
const Revendedor = AreaAzul.facade.Revendedor;
const UsuarioRevendedor = AreaAzul.facade.UsuarioRevendedor;

describe('facade Revendedor', function() {
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
  let idRevendedorPessoaFisica;
  let idRevendedorPessoaJuridica;

  function apagarRevendedoresDeTeste() {
    const TestHelpers = require('areaazul-test-helpers')(AreaAzul);
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
    return apagarRevendedoresDeTeste();
  });

  describe('cadastrar()', function() {
    it('cadastrar pessoa fisica funciona', function(done) {
      Revendedor.cadastrar(revendedorPF)
        .then(function(revenda) {
          should.exist(revenda);
          revenda.should.have.property('id');
          idRevendedorPessoaFisica = revenda.id;
          return UsuarioRevendedor
            .buscarPorLogin(revendedorPF.login);
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
          revenda.should.have.property('id');
          idRevendedorPessoaJuridica = revenda.id;
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('buscarPorId()', function() {
    it('Encontra Revenda Pessoa Física pelo ID', function(done) {
      Revendedor
        .buscarPorId(idRevendedorPessoaFisica)
        .then(function(revenda) {
          should.exist(revenda);
          revenda.should.have.property('conta');
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('Encontra Revenda Pessoa Jurídica pelo ID', function(done) {
      Revendedor
        .buscarPorId(idRevendedorPessoaJuridica)
        .then(function(revenda) {
          should.exist(revenda);
          revenda.should.have.property('conta');
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('buscarPorIdUsuarioRevendedor()', function() {
    let idUsuarioRevenda = null;

    before(function() {
      return UsuarioRevendedor
        .buscarPorLogin(revendedorPJ.login)
        .then(function(usuarioRevenda) {
          should.exist(usuarioRevenda);
          idUsuarioRevenda = usuarioRevenda.pessoa_fisica_id;
        });
    });

    it('retorna um revendedor', function(done) {
      Revendedor
        .buscarPorIdUsuarioRevendedor(idUsuarioRevenda)
        .then(function(revenda) {
          should.exist(revenda);
          revenda.should.have.property('conta');
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });
});
