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
