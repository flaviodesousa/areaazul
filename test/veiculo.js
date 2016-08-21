'use strict';

var debug = require('debug')('areaazul:test:veiculo');
var should = require('chai').should();

const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;

var Veiculo = Bookshelf.model('Veiculo');
var Veiculos = Bookshelf.collection('Veiculos');

var TestHelpers = require('../helpers/test');

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
      .then(function(cidade) {
        debug('Usando cidade ' + cidade.id);
        idCidade = cidade.id;
        debug('Usando estado ' + cidade.estado_id);
        idEstado = cidade.estado_id;
      })
      .then(function() {
        return TestHelpers.pegarUsuario();
      })
      .then(function(usuario) {
        debug('Usando usuario ' + usuario.id);
        idUsuarioComum = usuario.id;
      });
  });

  describe('cadastrar()', function() {
    it('grava veiculo', function(done) {
      var novoVeiculo = {
        usuario_pessoa_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: placaTeste,
        marca: marcaTeste,
        modelo: modeloTeste,
        cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste,
      };
      Veiculo
      .cadastrar(novoVeiculo)
      .then(function(veiculo) {
        idVeiculo = veiculo.id;
        return done();
      })
      .catch(function(e) {
        done(e);
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

    describe('desativar()', function() {
        it('falha para veiculo inexistente', function(done) {
            Veiculo
                .desativar({
                     id_veiculo: 0
                })
                .then(function() {
                    done();
                })
                .catch(function(e) {
                    should.exist(e);
                    done();
                });
        });

        it('desativa veiculo existente', function(done) {
            Veiculo
                .desativar({
                   id_veiculo : idVeiculo
                })
                .then(function() {
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
          should.exist(collection);
          done();
        },
        function(err) {
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
