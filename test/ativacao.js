'use strict';

var AreaAzul = require('../areaazul');
var Ativacao = AreaAzul.models.ativacao;

describe('model.ativacao', function() {

  describe('Ativar()', function() {
    it.skip('nao grava sem usuario', function(done) {
      var ativacao = {
        veiculo_id: 17,
      };

      Ativacao.ativar(ativacao,
        function() {
          done('Should not have saved!');
        },
        function() {
          done();
        });
    });
    it.skip('nao grava sem veiculo', function(done) {
      var ativacao = {
        usuario_id: 31,
      };

      Ativacao.ativar(ativacao,
        function() {
          done('Should not have saved!');
        },
        function() {
          done();
        });
    });
    it.skip('grava ativacao', function(done) {
      var ativacao = {
        usuario_id: 31,
        veiculo_id: 17,
      };

      Ativacao.ativar(ativacao,
        function() {
          done();
        },
        function(err) {
          done(err);
        });
    });

  });

});
