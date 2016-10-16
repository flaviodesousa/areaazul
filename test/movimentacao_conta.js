'use strict';

const debug = require('debug')('areaazul:test:movimentacao_conta');
const should = require('chai').should();
const money = require('money-math');

const AreaAzul = require('../areaazul');
const MovimentacaoConta = AreaAzul.facade.MovimentacaoDeConta;

const Bookshelf = require('../database');
const ContaModel = Bookshelf.model('Conta');

describe('facade MovimentacaoDeConta', function() {
  var revendedor = null;
  var conta = null;

  function buscarConta(id) {
    return new ContaModel({ id: id })
      .fetch({ require: true })
      .then(conta => {
        return conta.toJSON();
      });
  }

  before(function(done) {
    const TestHelpers = require('areaazul-test-helpers')(AreaAzul, Bookshelf);
    TestHelpers.pegarRevendedor()
      .then(function(r) {
        revendedor = r;
        return buscarConta(r.get('conta_id'));
      })
      .then(function(c) {
        conta = c;
        done();
      })
      .catch(function(e) {
        debug('erro inesperado', e);
        done(e);
      });
  });

  describe('inserirCredito()', function() {
    it('insere credito na conta', function(done) {
      var transacao = {
        conta_id: conta.id,
        valor: 100.00,
        tipo: 'Cartão de credito',
        historico: 'credito-de-teste'
      };

      MovimentacaoConta
        .inserirCredito(transacao)
        .then(function(resultado) {
          should.exist(resultado);
          resultado.should.have.property('valor', '100.00');
          resultado.should.have.property('conta_id', conta.id);
          return buscarConta(conta.id);
        })
        .then(c => {
          should.exist(c);
          c.should.have.property('id', conta.id);
          const saldoEsperado = money.add(conta.saldo, transacao.valor);
          c.should.have.property('saldo', saldoEsperado);
          conta = c;
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

  describe('inserirDebito()', function() {
    it('debita na conta', function(done) {
      var transacao = {
        conta_id: revendedor.get('conta_id'),
        valor: 10.00,
        tipo: 'o-que-eh-esse-tipo?',
        historico: 'debito-de-teste'
      };

      MovimentacaoConta
        .inserirDebito(transacao)
        .then(function(resultado) {
          should.exist(resultado);
          resultado.should.have.property('valor', '-10.00');
          resultado.should.have.property('conta_id', conta.id);
          return buscarConta(conta.id);
        })
        .then(c => {
          should.exist(c);
          c.should.have.property('id', conta.id);
          const saldoEsperado = money.add(conta.saldo, transacao.valor);
          c.should.have.property('saldo', saldoEsperado);
          conta = c;
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

});
