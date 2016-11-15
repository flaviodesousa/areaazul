'use strict';

const debug = require('debug')('areaazul:test:pessoa_fisica');
const should = require('chai').should();

const AreaAzul = require('../areaazul');
const PessoaFisica = AreaAzul.facade.PessoaFisica;

describe('facade PessoaFisica', function() {
  const cpfTeste = '04163501436';

  function deleteTestData(done) {
    const Bookshelf = require('../database');
    const Pessoa = Bookshelf.model('Pessoa');
    const PessoaFisica = Bookshelf.model('PessoaFisica');
    let pessoaId = null;
    new PessoaFisica({ cpf: cpfTeste })
      .fetch()
      .then(function(pf) {
        if (pf) {
          pessoaId = pf.id;
          return pf.destroy();
        }
      })
      .then(function() {
        if (pessoaId !== null) {
          return Pessoa
            .forge({
              id: pessoaId
            })
            .destroy();
        }
      })
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

    it('funciona!', function(done) {
      PessoaFisica.cadastrar({
        nome: 'PF preexistente',
        email: 'preexistente@example.com',
        telefone: '0000000000',
        cpf: cpfTeste,
        data_nascimento: '13/11/1981',
        sexo: 'feminino'
      })
        .then(function(pf) {
          should.exist(pf);
          pf.should.have.property('id');
          pf.should.have.property('cpf', cpfTeste);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

  });
  describe('buscarPorCPF()', function() {
    it('retorna null se cpf não existir', function(done) {
      const cpfInvalido = cpfTeste + '0';
      PessoaFisica.buscarPorCPF(cpfInvalido)
        .then(function(pf) {
          if (pf) {
            done(new Error(
              'Não deveria ter encontrado cpf inválido: ' + cpfInvalido));
          }
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('funciona!', function(done) {
      PessoaFisica.buscarPorCPF(cpfTeste)
        .then(function(pf) {
          should.exist(pf);
          pf.should.have.property('id');
          pf.should.have.property('cpf', cpfTeste);
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
