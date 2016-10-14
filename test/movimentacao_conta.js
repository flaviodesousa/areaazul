'use strict';

const debug = require('debug')('areaazul:test:movimentacao_conta');
const should = require('chai').should();

const AreaAzul = require('../areaazul');
const Bookshelf = require('../database');
const MovimentacaoConta = AreaAzul.facade.MovimentacaoDeConta;

describe('facade MovimentacaoDeConta', function() {
  var revendedor = null;

  before(function(done) {
    const TestHelpers = require('areaazul-test-helpers')(AreaAzul, Bookshelf);
    TestHelpers.pegarRevendedor()
      .then(function(r) {
        revendedor = r;
      })
      .then(function() {
        done();
      })
      .catch(function(e) {
        debug('erro inesperado', e);
        done(e);
      });
  });

  describe('inserirCredito()', function() {
    it('insere credito na conta', function(done) {
      var conta = {
        conta_id: revendedor.get('conta_id'),
        valor: 100.00,
        tipo: 'Cartão de credito',
        historico: 'credito-de-teste'
      };

      MovimentacaoConta
        .inserirCredito(conta)
        .then(function(credito) {
          should.exist(credito);
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

  describe('inserirDebito()', function() {
    it('debita na conta', function(done) {
      var conta = {
        conta_id: revendedor.get('conta_id'),
        valor: 10.00,
        tipo: 'o-que-eh-esse-tipo?',
        historico: 'debito-de-teste'
      };

      MovimentacaoConta
        .inserirDebito(conta)
        .then(function(debito) {
          should.exist(debito);
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

});
