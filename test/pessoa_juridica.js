'use strict';

const debug = require('debug')('areaazul:test:pessoa_juridica');
var should = require('chai').should();

const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;
var Pessoa = Bookshelf.model('Pessoa');
var PessoaJuridica = Bookshelf.model('PessoaJuridica');

describe('models.PessoaJuridica', function() {
  var cnpjTeste = 'teste-pj';

  function deleteTestData(done) {
    var pessoaId = null;
    PessoaJuridica
      .forge({ cnpj: cnpjTeste })
      .fetch()
      .then(function(pj) {
        if (pj) {
          pessoaId = pj.id;
          return pj.destroy();
        }
      })
      .then(function() {
        if (pessoaId !== null) {
          return Pessoa
            .forge({ id: pessoaId })
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
      PessoaJuridica.cadastrar({
        nome: 'nome-preexistente',
        telefone: '00 0000 0000',
        email: 'email@teste.teste',
        cnpj: cnpjTeste,
        nome_fantasia: 'PJ preexistente',
        razao_social: 'razao social teste',
        contato: 'contato-teste',
        ativo: true
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
