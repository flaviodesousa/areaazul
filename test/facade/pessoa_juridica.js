'use strict';

const debug = require('debug')('areaazul:test:pessoa_juridica');
const should = require('chai')
  .should();
const Promise = require('bluebird');

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul._internals.Bookshelf;
const PessoaJuridica = AreaAzul.facade.PessoaJuridica;

describe('facade PessoaJuridica', function() {
  const cnpjTeste = '16169879000130';
  const cnpjTesteSemContato = '39074454000142';
  const cnpjTesteSemTelefone = '13345236000101';

  function deleteTestData(done) {
    const TestHelpers =
      require('../../test-helpers')(AreaAzul);

    Bookshelf.transaction(trx =>
      Promise.all([
        TestHelpers.apagarPessoaJuridicaPeloCNPJ(cnpjTeste, trx),
        TestHelpers.apagarPessoaJuridicaPeloCNPJ(cnpjTesteSemContato, trx),
        TestHelpers.apagarPessoaJuridicaPeloCNPJ(cnpjTesteSemTelefone, trx)
      ]))
      .then(function() {
        return done();
      })
      .catch(function(e) {
        debug('erro inesperado', e);
        done(e);
      });
  }

  before(deleteTestData);

  describe('cadastrar()', function() {

    it('falha sem nome', function(done) {
      PessoaJuridica.cadastrar({
        telefone: '00 0000 0000',
        email: 'email@teste.teste',
        cnpj: cnpjTeste,
        nome_fantasia: 'PJ preexistente',
        razao_social: 'razao social teste',
        contato: 'contato-teste'
      })
        .then(function() {
          done(new Error('deveria ter falhado'));
        })
        .catch(AreaAzul.BusinessException, function(e) {
          should.exist(e);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('PASSA sem telefone', function(done) {
      PessoaJuridica.cadastrar({
        nome: 'nome-nao-existente',
        email: 'email@teste.teste',
        cnpj: cnpjTesteSemTelefone,
        nome_fantasia: 'PJ nao existente',
        razao_social: 'razao social teste',
        contato: 'contato-teste'
      })
        .then(function(pj) {
          should.exist(pj);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('falha sem email', function(done) {
      PessoaJuridica.cadastrar({
        nome: 'nome-preexistente',
        telefone: '00 0000 0000',
        cnpj: cnpjTeste,
        nome_fantasia: 'PJ preexistente',
        razao_social: 'razao social teste',
        contato: 'contato-teste'
      })
        .then(function() {
          done(new Error('deveria ter falhado'));
        })
        .catch(AreaAzul.BusinessException, function(e) {
          should.exist(e);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('falha sem cnpj', function(done) {
      PessoaJuridica.cadastrar({
        nome: 'nome-preexistente',
        telefone: '00 0000 0000',
        email: 'email@teste.teste',
        nome_fantasia: 'PJ preexistente',
        razao_social: 'razao social teste',
        contato: 'contato-teste'
      })
        .then(function() {
          done(new Error('deveria ter falhado'));
        })
        .catch(AreaAzul.BusinessException, function(e) {
          should.exist(e);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('falha sem nome_fantasia', function(done) {
      PessoaJuridica.cadastrar({
        nome: 'nome-preexistente',
        telefone: '00 0000 0000',
        email: 'email@teste.teste',
        cnpj: cnpjTeste,
        razao_social: 'razao social teste',
        contato: 'contato-teste'
      })
        .then(function() {
          done(new Error('deveria ter falhado'));
        })
        .catch(AreaAzul.BusinessException, function(e) {
          should.exist(e);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('falha sem razao_social', function(done) {
      PessoaJuridica.cadastrar({
        nome: 'nome-preexistente',
        telefone: '00 0000 0000',
        email: 'email@teste.teste',
        cnpj: cnpjTeste,
        nome_fantasia: 'PJ preexistente',
        contato: 'contato-teste'
      })
        .then(function() {
          done(new Error('deveria ter falhado'));
        })
        .catch(AreaAzul.BusinessException, function(e) {
          should.exist(e);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('PASSA sem contato', function(done) {
      PessoaJuridica.cadastrar({
        nome: 'nome-preexistente',
        telefone: '00 0000 0000',
        email: 'email@teste.teste',
        cnpj: cnpjTesteSemContato,
        nome_fantasia: 'PJ preexistente',
        razao_social: 'razao social teste'
      })
        .then(pj => {
          should.exist(pj);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('funciona!', function(done) {
      PessoaJuridica.cadastrar({
        nome: 'nome-preexistente',
        telefone: '00 0000 0000',
        email: 'email@teste.teste',
        cnpj: cnpjTeste,
        nome_fantasia: 'PJ preexistente',
        razao_social: 'razao social teste',
        contato: 'contato-teste'
      })
        .then(function(pj) {
          should.exist(pj);
          pj.should.have.property('id');
          pj.should.have.property('cnpj', cnpjTeste);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

  });

  after(deleteTestData);
});
