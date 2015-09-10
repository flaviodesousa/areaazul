'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../areaazul');
var CidadesCollection = AreaAzul.collections.Cidades;
var Cidade = AreaAzul.models.Cidade;

describe('collections.Cidades', function() {
  var idEstado = 1;
  describe('listar()', function() {
    it('lista cidades do estado 1', function(done) {
      CidadesCollection
        .listar(idEstado, function(cidades) {
          done();
        });
    });
    it('falha com id estado invalido', function(done) {
      CidadesCollection
        .listar(
            'undefined',
            function() {
              done('should fail');
            },
            function(e) {
              done();
            });
    });
  });
});
