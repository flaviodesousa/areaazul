'use strict';

var AreaAzul = require('../areaazul');
var Credenciado = AreaAzul.models.credenciado;

describe('model.credenciado', function() {

  describe('cadastrar()', function() {
    it.skip('Cadastrar', function(done) {
      var credenciado = {     };

      Credenciado.cadastrar(credenciado,
        function() {
          done('Nao deveria salvar');
        },
        function() {
          done();
        });
    });


  });

});
