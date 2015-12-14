'use strict';

var AreaAzul = require('../areaazul');
var should = require('chai').should();
var Veiculo = AreaAzul.models.Veiculo;
var Veiculos = AreaAzul.collections.Veiculos;
var Cidade = AreaAzul.models.Cidade;
var TestHelpers = require('../helpers/test');
var Estado = AreaAzul.models.Estado;

describe('model.veiculo', function() {

  function apagarDadosDeTeste(placa) {
    return TestHelpers.apagarVeiculoPorPlaca(placa);
  }

  var placaTeste = 'AAA1234';
  var marcaTeste = 'Marca teste';
  var modeloTeste = 'Modelo Teste';
  var corTeste = 'Cor Teste';
  var anoFabricadoTeste = '2015';
  var anoModeloTeste = '2015';
  var idEstado = null;
  var idCidade = null;
  var idVeiculo = null;
  var idUsuarioComum = null;

  before(function() {
    return TestHelpers.pegarCidade()
          .then(function(cidade){
              idCidade = cidade.id;
              idEstado = cidade.estado_id;
          })
          .then(function() {
            return TestHelpers.pegarUsuario()
                .then(function(usuario) {
                  idUsuarioComum = usuario.id;
          });
      });
  });

  describe('cadastrar()', function() {
    it('grava veiculo', function(done) {
      Veiculo
      .cadastrar({
        usuario_pessoa_id: idUsuarioComum,
        cidade_id: idCidade,
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

  describe('procurarVeiculo()', function() {
    it('retorna um veiculo', function(done) {
      Veiculo.procurarVeiculo(placaTeste)
      .then(function(veiculo) {
        done();
      })
      .catch(function(e) {
        done(e);
      });
    });
  });

describe('listar()', function() {
    it('retorna uma lista de veiculos ', function(done) {
      Veiculos.listar(
        function(collection) {
          console.dir(collection);
          should.exist(collection);
          done();
        },
        function(err) {
          console.dir(err);
          done(err);
        });
    });
});

  after(function(done) {
    apagarDadosDeTeste(placaTeste)
      .then(function() {
        done();
      })
      .catch(function(e) {
        done(e);
      });
  });

});
