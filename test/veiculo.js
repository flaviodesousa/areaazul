'use strict';

var AreaAzul = require('../areaazul');
var should = require('chai').should();
var Veiculo = AreaAzul.models.Veiculo;
var Veiculos = AreaAzul.collections.Veiculos;
var Usuario = AreaAzul.models.Usuario;
var Estado = AreaAzul.models.Estado;
var TestHelpers = require('../helpers/test');

describe('model.veiculo', function() {

  function apagarDadosDeTeste() {
    return TestHelpers.apagarVeiculoPorId(idVeiculo, idUsuarioComum);
  }

  var placaTeste = 'AAA1234';
  var marcaTeste = 'Marca teste';
  var modeloTeste = 'Modelo Teste';
  var corTeste = 'Cor Teste';
  var anoFabricadoTeste = '2015';
  var anoModeloTeste = '2015';
  var estadoTesteNome = 'Estado';
  var estadoTesteUf = 'UF';
  var idEstado = null;
  var idVeiculo = null;
  var idUsuarioComum = null;
  var loginUsuarioComPreExistente = 'usuario-pre-existente';
  var cpfUsuarioComumPreExistente = 'usuario-comum-test';


  before(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        return Estado
          .forge({nome: estadoTesteNome})
          .fetch()
          .then(function(e) {
            if (e) { return e; }
            return Estado.cadastrar({
                nome: estadoTesteNome,
                uf: estadoTesteUf,
              });
          });
      })
      .then(function(estado) {
        idEstado = estado.id;
      })
      .then(function() {
        done();
      })
      .catch(function(e) {
        done(e);
      });
  });

  describe('cadastrar()', function() {
    it('grava veiculo', function(done) {

      Veiculo
      .cadastrar({
        estado_id: idEstado,
        placa: placaTeste,
        marca: marcaTeste,
        modelo: modeloTeste,
        cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste,
      })
      .then(function(veiculo) {
        idVeiculo = veiculo.id;
        return done();
      })
      .catch(function(e) {
        done(e);
      });
    });

    describe('Procurar()', function() {
    it('retorna um veiculo', function(done) {
      var v = { id_veiculo: idVeiculo };
      Veiculos.procurar(v,
        function(model) {
          should.exist(model);
          done();
        },
        function(err) {
          done(err);
        });
    });
  });
    describe('procurarVeiculoPorPlaca()', function() {
    it('retorna um veiculo', function(done) {
      var v = { placa: placaTeste};
      Veiculo.procurarVeiculoPorPlaca(v,
          function(model) {
            should.exist(model);  
            done();
          }, 
          function(err) {
            done(err);
          });
    });
  });

    after(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        done();
      })
      .catch(function(e) {
        done(e);
      });
  });

  });

});