'use strict';

const debug = require('debug')('areaazul:test:fiscalizacao');
const should = require('chai').should();

const AreaAzul = require('../areaazul');
const Fiscalizacao = AreaAzul.facade.Fiscalizacao;

describe('facade Fiscalizacao', function() {
  var fiscalLogin = 'fiscal-teste-fiscalizacao';
  var fiscalId = null;

  before(function(done) {
    const Bookshelf = require('../database');
    const UsuarioFiscalModel = Bookshelf.model('UsuarioFiscal');
    const UsuarioFiscal = AreaAzul.facade.UsuarioFiscal;
    UsuarioFiscalModel
      .forge({ login: fiscalLogin })
      .fetch()
      .then(function(f) {
        if (f) {
          fiscalId = f.id;
          done();
        } else {
          UsuarioFiscal.cadastrar({
            login: fiscalLogin,
            nome: 'Fiscal Fiscalizacao Teste',
            nova_senha: 'senha-fiscal-teste',
            conf_senha: 'senha-fiscal-teste',
            email: fiscalLogin + '@areaazul.org',
            cpf: '58392095707'
          })
            .then(function(f) {
              fiscalId = f.id;
              done();
            })
            .catch(function(e) {
              debug('erro inesperado', e);
              done(e);
            });
        }
      });
  });

  describe('cadastrar()', function() {

    it('nao grava sem placa', function(done) {
      Fiscalizacao
        .cadastrar({
          latitude: 33.5,
          longitude: 44.5,
          usuario_fiscal_id: fiscalId
        })
        .then(function() {
          done(new Error('Nao deveria ter gravado sem placa.'));
        })
        .catch(function() {
          done();
        });
    });

    it('nao grava sem fiscal', function(done) {
      Fiscalizacao
        .cadastrar({
          placa: 'xyz1234',
          latitude: 33.5,
          longitude: 34.5
        })
        .then(function() {
          done(new Error('Nao deveria ter gravado sem fiscal'));
        })
        .catch(function() {
          done();
        });
    });

    it('grava com placa e fiscal', function(done) {
      Fiscalizacao
        .cadastrar({
          placa: 'xyz1234',
          latitude: 33.5,
          longitude: 34.5,
          usuario_fiscal_id: fiscalId
        })
        .then(function(f) {
          should.exist(f);
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });

    it('nao deve aceitar virgula decimal', function(done) {
      Fiscalizacao
        .cadastrar({
          placa: 'xyz1234',
          latitude: '33,5',
          longitude: '34,5',
          usuario_fiscal_id: fiscalId
        })
        .then(function() {
          done(new Error('Nao deveria ter gravado com virgula decimal.'));
        })
        .catch(function() {
          done();
        });
    });

    it('lat/lon devem ter até 10 casas decimais', function(done) {
      Fiscalizacao
        .cadastrar({
          placa: 'lon9999',
          latitude: '-89.9999999999',
          longitude: '-179.9999999999',
          usuario_fiscal_id: fiscalId
        })
        .then(function(novaAtivacao) {
          return new Fiscalizacao({ id: novaAtivacao.id })
            .fetch();
        })
        .then(function(f) {
          f.get('latitude')
            .should.be.equal('-89.9999999999', 'Latitude');
          f.get('longitude')
            .should.be.equal('-179.9999999999', 'Longitude');
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });

    it('lat/lon arredonda com mais de 10 casas decimais', function(done) {
      Fiscalizacao
        .cadastrar({
          placa: 'lon9999',
          latitude: '-89.99999999999',
          longitude: '-179.99999999999',
          usuario_fiscal_id: fiscalId
        })
        .then(function(fiscalizacao) {
          return new Fiscalizacao({ id: fiscalizacao.id })
            .fetch();
        })
        .then(function(f) {
          f.get('latitude')
            .should.be.equal('-90.0000000000', 'Latitude');
          f.get('longitude')
            .should.be.equal('-180.0000000000', 'Longitude');
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });

  describe('listar()', function() {
    it('retorna uma lista de fiscalizacoes', function() {
      return Fiscalizacao
        .listar(undefined)
        .then(function(fiscalizacoes) {
          should.exist(fiscalizacoes);
        });
    });
    it('limita por tempo', function() {
      return Fiscalizacao
        .listar({ minutos: 10 })
        .then(function(fiscalizacoes) {
          should.exist(fiscalizacoes);
        });
    });
    it('limita por respostas', function() {
      return Fiscalizacao
        .listar({ limite: 2 })
        .then(function(fiscalizacoes) {
          should.exist(fiscalizacoes);
        });
    });
    it('limita por tempo E respostas', function() {
      Fiscalizacao
        .listar({ limite: 2, minutos: 10 })
        .then(function(fiscalizacoes) {
          should.exist(fiscalizacoes);
        });
    });
  });
});
