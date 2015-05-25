'use strict';

var AreaAzul = require('../areaazul');
var should = require('chai').should();
var Veiculo = AreaAzul.models.veiculo;
var Usuario = AreaAzul.models.Usuario;
var Estado = AreaAzul.models.estado.Estado;

describe('model.veiculo', function() {
  var usuarioTeste = 'usuarioVeiculo';
  var estadoTeste = 'estadoTeste';

  before(function(done) {
    done();
  });

  after(function(done) {
    done();
  });
  describe('cadastrar()', function() {
    it.skip('grava veiculo', function(done) {
      var veiculo = {
        estado_id: 1,
        placa: 'bbc',
        placa_numero: 1234,
        marca: 'Chrsyler',
        modelo: '300c',
        cor: 'preto',
        ano_fabricado: 2015,
        ano_modelo: 2015,
        usuario_id: 31,
      };
      Veiculo.cadastrar(veiculo,
        function(veiculo) {
          should.exist(veiculo);
          done();
        },
        function(err) {
          done(err);
        });
    });
  });

  describe('Procurar()', function() {
    it.skip('retorna um veiculo', function(done) {
      var v = { id_veiculo: 11 };
      Veiculo.procurar(v,
        function(model) {
          should.exist(model);
          model.should.not.be.empty();
          done();
        },
        function(err) {
          done(err);
        });
    });
  });
  describe('procurarVeiculoPorPlaca()', function() {
    it.skip('retorna um veiculo', function(done) {
      var v = { placa: 'bbe1244'};
      Veiculo.procurarVeiculoPorPlaca(v,
        function(model) {
          should.exist(model);
          model.should.not.empty();
          done();
        },
        function(err) {
          console.log(err);
          done(err);
        });
    });
  });

});
