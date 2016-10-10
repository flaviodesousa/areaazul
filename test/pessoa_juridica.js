'use strict';

const debug = require('debug')('areaazul:test:pessoa_juridica');
var should = require('chai').should();

const Bookshelf = require('../database');

const PessoaJuridica = Bookshelf.model('PessoaJuridica');

const AreaazulTestHelpers = require('areaazul-test-helpers')(Bookshelf);

describe('models.PessoaJuridica', function() {
  var cnpjTeste = '16169879000130';

  function deleteTestData(done) {
    new PessoaJuridica({ cnpj: cnpjTeste })
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
          should.exist(pj.attributes);
          should.exist(pj.attributes.cnpj);
          pj.attributes.cnpj.should.be.equal(cnpjTeste);
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
