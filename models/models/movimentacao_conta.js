'use strict';

var _ = require('lodash');
var AreaAzul = require('../../areaazul');
var Bookshelf = require('bookshelf').conexaoMain;
var Conta = Bookshelf.model('Conta');
var math = require('mathjs');

var MovimentacaoConta = Bookshelf.Model.extend({
  tableName: 'movimentacao_conta'
}, {

  _inserirMovimentacaoConta: function(movimentacaoConta, options) {
    var optionsInsert = _.merge({ method: 'insert' }, options || {});
    var optionsUpdate = _.merge({ method: 'update', patch: true },
      options || {});

    return new Conta({ id_conta: movimentacaoConta.conta_id })
      .fetch(_.merge({ require: true }, options))
      .catch(function(e) {
        if (e instanceof Bookshelf.Model.NotFoundError) {
          throw new AreaAzul.BusinessException(
            'Conta invalida', {
              movimentacaoconta: movimentacaoConta
            });
        }
        throw e;
      })
      .then(function(c) {
        var saldoAtual = Number(c.get('saldo'));
        var novoSaldo = math.sum(saldoAtual, movimentacaoConta.valor);

        return c.save({ saldo: novoSaldo }, optionsUpdate);
      })
      .then(function(c) {
        return MovimentacaoConta.forge({
            data_deposito: new Date(),
            historico: movimentacaoConta.historico,
            tipo: movimentacaoConta.tipo,
            valor: movimentacaoConta.valor,
            ativo: true,
            conta_id: c.id,
            pessoa_id: movimentacaoConta.pessoa_id
          })
          .save(null, optionsInsert);
      });
  },
  _inserirCredito: function(credito, options) {
    return MovimentacaoConta
      ._inserirMovimentacaoConta(credito, options);
  },
  inserirCredito: function(credito) {
    return Bookshelf.transaction(function(t) {
      return MovimentacaoConta
        ._inserirCredito(credito, { transacting: t });
    });
  },
  _inserirDebito: function(debito, options) {
    if (debito.valor > 0) {
      debito.valor = -debito.valor;
    }
    return MovimentacaoConta
      ._inserirMovimentacaoConta(debito, options);
  },
  inserirDebito: function(debito) {
    return Bookshelf.transaction(function(t) {
      return MovimentacaoConta
        ._inserirCredito(debito, { transacting: t });
    });
  }
});
Bookshelf.model('MovimentacaoConta', MovimentacaoConta);

module.exports = MovimentacaoConta;
