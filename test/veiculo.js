'use strict';

const debug = require('debug')('areaazul:test:veiculo');
const should = require('chai').should();

const AreaAzul = require('../areaazul');
const Veiculo = AreaAzul.facade.Veiculo;

const Bookshelf = require('../database');
const TestHelpers = require('areaazul-test-helpers')(AreaAzul, Bookshelf);
const AreaAzulUtils = require('areaazul-utils');

describe('facade Veiculo', function() {
  function apagarDadosDeTeste(placa) {
    return TestHelpers.apagarVeiculoPorPlaca(placa);
  }

  var placaInexistente = 'VEI-1373';
  var placaTeste = 'AAA-1234';
  var placaTesteSemMascara =
    AreaAzulUtils.placaSemMascara(placaTeste);
  var marcaTeste = 'Marca teste';
  var modeloTeste = 'Modelo Teste';
  var corTeste = 'Cor Teste';
  var anoFabricadoTeste = '2015';
  var anoModeloTeste = '2015';
  var idCidade = null;
  var idVeiculo = null;
  var idUsuarioComum = null;

  before(function() {
    return TestHelpers.pegarCidade()
      .then(function(cidade) {
        debug('Usando cidade ' + cidade.id);
        idCidade = cidade.id;
      })
      .then(function() {
        return TestHelpers.pegarUsuario();
      })
      .then(function(usuario) {
        debug('Usando usuario ' + usuario.id);
        idUsuarioComum = usuario.id;
      })
      .then(function() {
        return apagarDadosDeTeste(placaTeste);
      })
      .then(function() {
        return apagarDadosDeTeste(placaInexistente);
      });
  });

  describe('cadastrar()', function() {
    it('grava veiculo', function(done) {
      var novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: placaTeste,
        marca: marcaTeste,
        modelo: modeloTeste,
        cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste
      };
      Veiculo
        .cadastrar(novoVeiculo)
        .then(function(veiculo) {
          should.exist(veiculo);
          veiculo.should.have.property('id');
          veiculo.should.have.property('placa', placaTesteSemMascara);
          veiculo.should.have.property('cidade');
          idVeiculo = veiculo.id;
          return done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });


  describe('buscarPorPlaca()', function() {
    it('retorna um veiculo', function(done) {
      Veiculo.buscarPorPlaca(placaTeste)
        .then(function(veiculo) {
          should.exist(veiculo);
          veiculo.should.have.property('id', idVeiculo);
          veiculo.should.have.property('placa', placaTesteSemMascara);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('retorna indefinido se placa não cadastrada', function(done) {
      Veiculo.buscarPorPlaca(placaInexistente)
        .then(function(veiculo) {
          should.not.exist(veiculo);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('listar()', function() {
    it('retorna uma lista de veiculos ', function(done) {
      Veiculo
        .listar()
        .then(veiculos => {
          should.exist(veiculos);
          veiculos.should.have.property('ativos');
          veiculos.should.have.property('expirando');
          veiculos.should.have.property('expirados');
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

});
