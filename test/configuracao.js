'use strict';

var should = require('chai').should();
const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
var Configuracao = Bookshelf.model('Configuracao');
const TestHelpers = require('areaazul-test-helpers')(AreaAzul);

describe('model.configuracao', function() {
  var idCidade = null;

  before(function() {
    return TestHelpers
      .pegarCidade()
      .then(function(cidade) {
        idCidade = cidade.id;
      });
  });

  describe('alterar()', function() {
    it('alterar as configurações', function(done) {
      var config = {
        valor_ativacao: 6.00,
        tempo_tolerancia: 16.0,
        franquia: 10.0,
        ciclo_ativacao: 70.0,
        ciclo_fiscalizacao: 60.0,
        cidade_id: idCidade
      };
      Configuracao.alterar(config)
        .then(function(configuracao) {
          should.exist(configuracao);
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });
});
