'use strict';

var should = require('chai').should();

var AreaAzul = require('../areaazul');
var Pessoa = AreaAzul.models.pessoa.Pessoa;
var PessoaJuridica = AreaAzul.models.PessoaJuridica;

describe('models.PessoaJuridica', function() {
  var cnpjTeste = 'teste-pj';

  function deleteTestData(done) {
    var pessoaId = null;
    PessoaJuridica
      .forge({cnpj: cnpjTeste})
      .fetch()
      .then(function(pj) {
        if (pj !== null) {
          pessoaId = pj.get('pessoa_id');
          return pj.destroy();
        }
      })
      .then(function() {
        if (pessoaId !== null) {
          return Pessoa
            .forge({id_pessoa: pessoaId})
            .destroy();
        }
      })
      .then(function() {
        return done();
      })
      .catch(function(e) {
        done(e);
      });
  }

  before(deleteTestData);

  describe('cadastrar()', function() {

    it('funciona!', function(done) {
      PessoaJuridica.cadastrar({
        nome: 'nome-preexistente',
        telefone: 'telefone-teste',
        email: 'email@teste.teste',
        cnpj: cnpjTeste,
        nome_fantasia: 'PJ preexistente',
        razao_social: 'razao social teste',
        inscricao_estadual: 'insc-estadual-teste',
        contato: 'contato-teste',
        ramo_atividade: 'ramo-atividade-teste',
        ativo: true,
      })
      .then(function(pj) {
        should.exist(pj);
        should.exist(pj.attributes);
        should.exist(pj.attributes.cnpj);
        pj.attributes.cnpj.should.be.equal(cnpjTeste);
        done();
      })
      .catch(function(e) {
        done(e);
      });
    });

  });

  after(deleteTestData);
});
