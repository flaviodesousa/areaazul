'use strict';

var AreaAzul = require('../areaazul');
var should = require('chai').should();
var Revendedor = AreaAzul.models.revendedor;

describe('model.revendedor', function() {

  describe('buscarRevendedor()', function() {
    it.skip('retorna um revendedor', function(done) {
      var revendedor = { id_usuario: 53};
      Revendedor.buscarRevendedor(revendedor,
        function(model) {
          should.exist(model);
          done();
        },
        function(err) {
          done(err);
        });
    });
  });

});
