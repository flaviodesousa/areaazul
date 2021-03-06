'use strict';

const debug = require('debug')('areaazul:test:fiscalizacao');
const should = require('chai')
  .should();
const moment = require('moment');

const Bookshelf = require('../../database');
const FiscalizacaoModel = Bookshelf.model('Fiscalizacao');

const AreaAzul = require('../../areaazul');
const Fiscalizacao = AreaAzul.facade.Fiscalizacao;

describe('facade Fiscalizacao', function() {
  const fiscalLogin = 'fiscal-teste-fiscalizacao';
  let fiscalId = null;

  before(function(done) {
    const UsuarioFiscalModel = Bookshelf.model('UsuarioFiscal');
    Bookshelf.transaction(trx =>
      UsuarioFiscalModel
        .forge({ login: fiscalLogin })
        .fetch({ transacting: trx })
        .then(function(f) {
          if (f) {
            fiscalId = f.id;
            return f;
          }
          return UsuarioFiscalModel._cadastrar({
            login: fiscalLogin,
            nome: 'Fiscal Fiscalizacao Teste',
            nova_senha: 'senha-fiscal-teste',
            conf_senha: 'senha-fiscal-teste',
            email: fiscalLogin + '@areaazul.org',
            cpf: '58392095707'
          }, { transacting: trx });
        })
        .then(function(f) {
          fiscalId = f.id;
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        }));
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
        .catch(AreaAzul.BusinessException, () => {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
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
        .catch(AreaAzul.BusinessException, () => {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('grava com placa e fiscal', function(done) {
      Fiscalizacao
        .cadastrar({
          placa: 'are4701',
          latitude: 33.5,
          longitude: 34.5,
          usuario_fiscal_id: fiscalId
        })
        .then(function(f) {
          should.exist(f);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('grava com placa desconhecida e fiscal', function(done) {
      Fiscalizacao
        .cadastrar({
          placa: 'zzz9999',
          latitude: 33.5,
          longitude: 34.5,
          usuario_fiscal_id: fiscalId
        })
        .then(function(f) {
          should.exist(f);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('grava com placa Mercosul', function(done) {
      Fiscalizacao
        .cadastrar({
          placa: '89ar9br',
          latitude: 33.5,
          longitude: 34.5,
          usuario_fiscal_id: fiscalId
        })
        .then(function(f) {
          should.exist(f);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
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
        .catch(AreaAzul.BusinessException, () => {
          done(new Error('Nao deveria ter lançado exceção de negócio com virgula decimal.'));
        })
        .catch(function() {
          done();
        });
    });

    it('lat/lon devem ter até 10 casas decimais', function(done) {
      Fiscalizacao
        .cadastrar({
          placa: 'tat1540',
          latitude: '-89.9999999999',
          longitude: '-179.9999999999',
          usuario_fiscal_id: fiscalId
        })
        .then(function(fiscalizacao) {
          return new FiscalizacaoModel({ id: fiscalizacao.id })
            .fetch();
        })
        .then(function(f) {
          f.get('latitude')
            .should
            .be
            .equal('-89.9999999999', 'Latitude');
          f.get('longitude')
            .should
            .be
            .equal('-179.9999999999', 'Longitude');
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('lat/lon arredonda com mais de 10 casas decimais', function(done) {
      Fiscalizacao
        .cadastrar({
          placa: 'are4701',
          latitude: '-89.99999999999',
          longitude: '-179.99999999999',
          usuario_fiscal_id: fiscalId
        })
        .then(function(fiscalizacao) {
          return new FiscalizacaoModel({ id: fiscalizacao.id })
            .fetch();
        })
        .then(function(f) {
          f.get('latitude')
            .should
            .be
            .equal('-90.0000000000', 'Latitude');
          f.get('longitude')
            .should
            .be
            .equal('-180.0000000000', 'Longitude');
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('listar()', function() {
    it('retorna uma lista de fiscalizacoes', function(done) {
      Fiscalizacao
        .listar()
        .then(function(fiscalizacoes) {
          should.exist(fiscalizacoes);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('listarAtivas()', function() {
    it('retorna uma lista de fiscalizacoes', function(done) {
      Fiscalizacao
        .listarAtivas()
        .then(function(fiscalizacoes) {
          should.exist(fiscalizacoes);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('limita por 1 minuto', function(done) {
      Fiscalizacao
        .listarAtivas(1)
        .then(function(fiscalizacoes) {
          should.exist(fiscalizacoes);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });
});
