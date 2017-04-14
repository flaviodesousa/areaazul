'use strict';

const debug = require('debug')('areaazul:test:pessoa_juridica');
const should = require('chai').should();

const AreaAzul = require('../../areaazul');
const PessoaJuridica = AreaAzul.facade.PessoaJuridica;

describe('facade PessoaJuridica', function() {
  const cnpjTeste = '16169879000130';

  function deleteTestData(done) {
    const Bookshelf = require('../../database');
    const AreaazulTestHelpers =
      require('../../test-helpers')(AreaAzul);
    const PessoaJuridicaModel = Bookshelf.model('PessoaJuridica');
    new PessoaJuridicaModel({ cnpj: cnpjTeste })
      .fetch({ require: true })
      .then(pj => {
        return AreaazulTestHelpers
          .apagarPessoaJuridica(pj.id);
      })
      .then(function() {
        return done();
      })
      .catch(Bookshelf.NotFoundError, () => {
        done();
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
        .catch(function(e) {
          should.exist(e);
          done();
        });
    });

    it('falha sem telefone', function(done) {
      PessoaJuridica.cadastrar({
        nome: 'nome-preexistente',
        email: 'email@teste.teste',
        cnpj: cnpjTeste,
        nome_fantasia: 'PJ preexistente',
        razao_social: 'razao social teste',
        contato: 'contato-teste'
      })
        .then(function() {
          done(new Error('deveria ter falhado'));
        })
        .catch(function(e) {
          should.exist(e);
          done();
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
        .catch(function(e) {
          should.exist(e);
          done();
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
        .catch(function(e) {
          should.exist(e);
          done();
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
        .catch(function(e) {
          should.exist(e);
          done();
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
        .catch(function(e) {
          should.exist(e);
          done();
        });
    });

    it('falha sem contato', function(done) {
      PessoaJuridica.cadastrar({
        nome: 'nome-preexistente',
        telefone: '00 0000 0000',
        email: 'email@teste.teste',
        cnpj: cnpjTeste,
        nome_fantasia: 'PJ preexistente',
        razao_social: 'razao social teste'
      })
        .then(function() {
          done(new Error('deveria ter falhado'));
        })
        .catch(function(e) {
          should.exist(e);
          done();
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
