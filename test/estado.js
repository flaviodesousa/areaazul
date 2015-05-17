'use strict';

var AreaAzul = require('../areaazul');
var Estado = AreaAzul.models.estado;

describe('model.estado', function() {

  describe('cadastrar()', function() {
    it.skip('nao grava com nomes iguais', function(done) {
      var estado = {
        nome: 'ACRE',
        uf: 'AC',
      };

      Estado.cadastrar(estado,
        function() {
          done('Should not have saved!');
        },
        function() {
          done();
        });
    });
    it.skip('nao grava sem nome de estado', function(done) {
      var estado = {
        uf: 'AC',
      };

      Estado.cadastrar(estado,
        function() {
          done('Should not have saved!');
        },
        function() {
          done();
        });
    });
    it.skip('nao grava com nome já cadastrado', function(done) {
      var estado = {
        nome: 'TOCANTINS',
        uf: 'TO',
      };

      Estado.cadastrar(estado,
        function() {
          done('Nao deve salvar ja cadastrado');
        },
        function() {
          done();
        });
    });


  });

});
