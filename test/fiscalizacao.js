'use strict';

var should = require('chai').should();

var AreaAzul = require('../areaazul');
var Fiscalizacao = AreaAzul.models.Fiscalizacao;
var Fiscalizacoes = AreaAzul.collections.Fiscalizacoes;
var UsuarioFiscal = AreaAzul.models.UsuarioFiscal;
var UsuariosFiscais = AreaAzul.collections.UsuariosFiscais;

describe('model.fiscalizacao', function() {
  var fiscalLogin = 'fiscal-teste-fiscalizacao';
  var fiscalId = null;

  before(function(done) {
    UsuarioFiscal
      .forge({login: fiscalLogin})
      .fetch()
      .then(function(f) {
        if (f) {
          fiscalId = f.id;
          done();
        } else {
          UsuarioFiscal.cadastrar({
            login: fiscalLogin,
            nome: 'Fiscal Fiscalizacao Teste',
            email: fiscalLogin + '@areaazul.org',
            cpf: fiscalLogin,
          })
          .then(function(f) {
            fiscalId = f.id;
            done();
          })
          .catch(function(e) {
            done(e);
          });
        }
      });
  });

  describe('cadastrar()', function() {

    it('nao grava sem placa', function(done) {
      Fiscalizacao.cadastrar({
        latitude: 33.5,
        longitude: 44.5,
        fiscal_id: fiscalId,
      }, function() {
        done(new Error('Nao deveria ter gravado sem placa.'));
      }, function() {
        done();
      });
    });

    it('nao grava sem fiscal', function(done) {
      Fiscalizacao.cadastrar({
        placa: 'xyz1234',
        latitude: 33.5,
        longitude: 34.5,
      }, function() {
        done(new Error('Nao deveria ter gravado sem fiscal'));
      }, function() {
        done();
      });
    });

    it('grava com placa e fiscal', function(done) {
      Fiscalizacao.cadastrar({
        placa: 'xyz1234',
        latitude: 33.5,
        longitude: 34.5,
        fiscal_id: fiscalId,
      }, function(f) {
        should.exist(f);
        done();
      }, function(err) {
        done(err);
      });
    });

    it('nao deve aceitar virgula decimal', function(done) {
      Fiscalizacao.cadastrar({
        placa: 'xyz1234',
        latitude: '33,5',
        longitude: '34,5',
        fiscal_id: fiscalId,
      }, function() {
        done(new Error('Nao deveria ter gravado com virgula decimal.'));
      }, function() {
        done();
      });
    });

    it('lat/lon devem ter até 10 casas decimais', function(done) {
      Fiscalizacao.cadastrar({
        placa: 'lon9999',
        latitude: '-89.9999999999',
        longitude: '-179.9999999999',
        fiscal_id: fiscalId,
      }, function(model) {
        Fiscalizacao
          .forge({id_fiscalizacao: model.id})
          .fetch()
          .then(function(f) {
            f.get('latitude')
              .should.be.equal( '-89.9999999999', 'Latitude');
            f.get('longitude')
              .should.be.equal('-179.9999999999', 'Longitude');
            done();
          })
          .catch(function(e) {
            done(e);
          });
      }, function(err) {
        done(err);
      });
    });

    it('lat/lon arredonda com mais de 10 casas decimais', function(done) {
      Fiscalizacao.cadastrar({
        placa: 'lon9999',
        latitude:   '-89.99999999999',
        longitude: '-179.99999999999',
        fiscal_id: fiscalId,
      }, function(model) {
        Fiscalizacao
          .forge({id_fiscalizacao: model.id})
          .fetch()
          .then(function(f) {
            f.get('latitude')
              .should.be.equal( '-90.0000000000', 'Latitude');
            f.get('longitude')
              .should.be.equal('-180.0000000000', 'Longitude');
            done();
          })
          .catch(function(e) {
            done(e);
          });
      }, function(err) {
        done(err);
      });
    });
  });

  describe('listar()', function() {
    it('retorna uma lista de fiscalizacoes', function(done) {
      Fiscalizacoes.listar(undefined,
        function(collection) {
          should.exist(collection);
          done();
        },
        function(err) {
          done(err);
        });
    });
  });
});
