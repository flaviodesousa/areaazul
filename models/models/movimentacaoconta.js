'use strict';

var _ = require('lodash');
var AreaAzul = require('../../areaazul');
var BusinessException = AreaAzul.BusinessException;
var Bookshelf = require('bookshelf').conexaoMain;
var Conta = require('./conta');
var math = require('mathjs');

var MovimentacaoConta = Bookshelf.Model.extend({
  tableName: 'movimentacao_conta',
  idAttribute: 'id_movimentacao_conta',
}, {

  _inserirMovimentacaoConta: function(movimentacaoconta, options) {
    var optionsInsert = _.merge({}, options || {}, {
      method: 'insert',
    });
    var optionsUpdate = _.merge({}, options || {}, {
      method: 'update',
    }, {
      patch: true,
    });

    return Conta
      .forge({
        pessoa_id: movimentacaoconta.pessoa_id,
      })
      .fetch()
      .then(function(c) {

        var saldoAtual = Number(c.get('saldo'));
        var novoSaldo = math.sum(saldoAtual, movimentacaoconta.valor);

        if (!c) {
          throw new BusinessException(
            'Conta invalida', {
              movimentacaoconta: movimentacaoconta,
            });
        }
        return c.save({
            saldo: novoSaldo,
          }, optionsUpdate)
          .then(function(c) {
            return MovimentacaoConta.forge({
                data_deposito: new Date(),
                historico: movimentacaoconta.historico,
                tipo: movimentacaoconta.tipo,
                valor: movimentacaoconta.valor,
                ativo: true,
                conta_id: c.id,
                pessoa_id: movimentacaoconta.pessoa_id,
              })
              .save(null, optionsInsert);
          });
      });
  },
  _inserirCredito: function(conta, options) {
    return MovimentacaoConta
      ._inserirMovimentacaoConta(conta, options);
  },
  inserirCredito: function(conta) {
    return Bookshelf.transaction(function(t) {
      return MovimentacaoConta
        ._inserirCredito(conta, {
          transacting: t,
        });
    });
  },
  _inserirDebito: function(conta, options) {
    if (conta.valor > 0) {
      conta.valor = -conta.valor;
    }
    return MovimentacaoConta
      ._inserirMovimentacaoConta(conta, options);
  },
  inserirDebito: function(conta) {
    return Bookshelf.transaction(function(t) {
      return MovimentacaoConta
        ._inserirCredito(conta, {
          transacting: t,
        });
    });
  },

});
module.exports = MovimentacaoConta;
