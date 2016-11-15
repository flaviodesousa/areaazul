'use strict';

const _ = require('lodash');
const money = require('money-math');
const log = require('../../logging');
const AreaAzul = require('../../areaazul');
const Bookshelf = require('../../database');
const Conta = Bookshelf.model('Conta');

const MovimentacaoConta = Bookshelf.Model.extend({
  tableName: 'movimentacao_conta',
  conta: function() {
    return this.belongsTo('Conta');
  }
}, {
  _inserirMovimentacaoConta: function(movimentacaoConta, options) {
    if (!options || !options.transacting) {
      log.err('Tentativa de movimentação de conta fora de uma transação',
        { movimentacaoConta: movimentacaoConta, options: options });
      throw new Error('Falta transação');
    }
    const optionsInsert = _.merge({ method: 'insert' }, options);
    const optionsUpdate = _.merge({ method: 'update', patch: true },
      options);

    return new Conta({ id: movimentacaoConta.conta_id })
      .fetch(_.merge({ require: true }, options))
      .catch(Bookshelf.NotFoundError, () => {
        throw new AreaAzul.BusinessException(
          'Conta inválida', {
            movimentacaoConta: movimentacaoConta
          });
      })
      .then(function(conta) {
        const novoSaldo = money.add(
          conta.get('saldo'),
          movimentacaoConta.valor);

        return conta.save({ saldo: novoSaldo }, optionsUpdate);
      })
      .then(function(c) {
        return new MovimentacaoConta({
          data: new Date(),
          historico: movimentacaoConta.historico,
          tipo: movimentacaoConta.tipo,
          valor: movimentacaoConta.valor,
          saldo_resultante: c.get('saldo'),
          conta_id: c.id
        })
          .save(null, optionsInsert);
      });
  },
  _inserirCredito: function(credito, options) {
    if (!(credito.valor instanceof String)) {
      credito.valor = money.floatToAmount(credito.valor);
    }
    if (money.cmp(credito.valor, '0.00') <= 0) {
      throw new AreaAzul.BusinessException(
        'Valor do crédito deve ser maior que zero',
        credito);
    }
    return MovimentacaoConta
      ._inserirMovimentacaoConta(credito, options);
  },
  _inserirDebito: function(debito, options) {
    if (!(debito.valor instanceof String)) {
      debito.valor = money.floatToAmount(debito.valor);
    }
    if (money.cmp(debito.valor, '0.00') <= 0) {
      throw new AreaAzul.BusinessException(
        'Valor do débito deve ser maior que zero',
        debito);
    }
    debito.valor = money.subtract('0.00', debito.valor);
    return MovimentacaoConta
      ._inserirMovimentacaoConta(debito, options);
  }
});
Bookshelf.model('MovimentacaoConta', MovimentacaoConta);

module.exports = MovimentacaoConta;
