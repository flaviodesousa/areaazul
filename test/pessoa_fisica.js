'use strict';

var should = require('should');

var AreaAzul = require('../areaazul');
var Pessoa = AreaAzul.models.pessoa.Pessoa;
var PessoaFisica = AreaAzul.models.pessoafisica.PessoaFisica;

describe('models.PessoaFisica', function () {
  var cpf_teste = 'teste-pf';

  function delete_test_data(done) {
    var pessoa_id = null;
    PessoaFisica
      .forge({cpf: cpf_teste})
      .fetch()
      .then(function (pf) {
        if (pf !== null) {
          pessoa_id = pf.get('pessoa_id');
          return pf.destroy();
        }
      })
      .then(function () {
        if (pessoa_id !== null) {
          return Pessoa
            .forge({id_pessoa: pessoa_id})
            .destroy();
        }
      })
      .then(function () {
        return done();
      })
      .catch(function (e) {
        done(e);
      });
  }

  before(delete_test_data);

  describe('cadastrar()', function () {

    it('funciona!', function (done) {
      PessoaFisica.cadastrar({
        nome: 'PF preexistente',
        email: 'preexistente@example.com',
        telefone: '0',
        cpf: cpf_teste,
        data_nascimento: new Date(1981, 11, 13),
        sexo: 'feminino'
      })
      .then(function (pf) {
        should.exist(pf);
        should.exist(pf.attributes);
        should.exist(pf.attributes.cpf);
        pf.attributes.cpf.should.be.exactly(cpf_teste);
        done();
      })
      .catch(function (e) {
        done(e);
      });
    });

  });

  after(delete_test_data);
});
