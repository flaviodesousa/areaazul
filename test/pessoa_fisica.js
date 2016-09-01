'use strict';

const debug = require('debug')('areaazul:test:pessoa_fisica');
var should = require('chai').should();

const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;
const Pessoa = Bookshelf.model('Pessoa');
const PessoaFisica = Bookshelf.model('PessoaFisica');

describe('models.PessoaFisica', function () {
  var cpfTeste = '04163501436';

  function deleteTestData(done) {
    var pessoaId = null;
    new PessoaFisica({cpf: cpfTeste})
      .fetch()
      .then(function (pf) {
        if (pf) {
          pessoaId = pf.id;
          return pf.destroy();
        }
      })
      .then(function () {
        if (pessoaId !== null) {
          return Pessoa
            .forge({
              id: pessoaId
            })
            .destroy();
        }
      })
      .then(function () {
        return done();
      })
      .catch(function (e) {
        debug('erro inesperado', e);
        done(e);
      });
  }

  before(deleteTestData);

  describe('cadastrar()', function () {

    it('funciona!', function (done) {
      PessoaFisica.cadastrar({
        nome: 'PF preexistente',
        email: 'preexistente@example.com',
        telefone: '0000000000',
        cpf: cpfTeste,
        data_nascimento: new Date(1981, 11, 13),
        sexo: 'feminino'
      })
        .then(function (pf) {
          should.exist(pf);
          should.exist(pf.id);
          pf.get('cpf').should.equal(cpfTeste);
          done();
        })
        .catch(function (e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

  });
  describe('buscarPorCPF()', function () {
    it('retorna null se cpf não existir', function (done) {
      var cpfInvalido = cpfTeste + '0';
      PessoaFisica.buscarPorCPF(cpfInvalido)
        .then(function(pf) {
          if (pf) {
            done(new Error(
              'Não deveria ter encontrado cpf inválido: ' + cpfInvalido));
          }
          done();
        })
        .catch(function (e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('funciona!', function (done) {
      PessoaFisica.buscarPorCPF(cpfTeste)
        .then(function (pf) {
          should.exist(pf);
          should.exist(pf.id);
          pf.get('cpf').should.equal(cpfTeste);
          done();
        })
        .catch(function (e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

  });
  after(deleteTestData);
});
