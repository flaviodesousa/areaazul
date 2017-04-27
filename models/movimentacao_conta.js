'use strict';

const _ = require('lodash');
const debug = require('debug')('areaazul:models:movimentacao_conta');
const money = require('money-math');
const log = require('../logging');
const AreaAzul = require('../areaazul');
const Bookshelf = require('../database');
const Conta = Bookshelf.model('Conta');

const MovimentacaoConta = Bookshelf.Model.extend({
  tableName: 'movimentacao_conta',
  conta: function() {
    return this.belongsTo('Conta', 'conta_id');
  }
}, {
  /**
   * Insere transação na conta e atualiza o saldo da conta
   * @param movimentacaoConta {object} - detalhes da transação
   * @param movimentacaoConta.conta_id {number} - id da conta
   * @param movimentacaoConta.historico {string} - descrição detalhada
   * @param movimentacaoConta.tipo {string} - texto arbitrário que identifica o tipo
   * @param movimentacaoConta.valor {string} - valor positivo ou negativo
   * @param options {object} - opções do knex
   * @param options.transacting {object} - transação ativa
   * @returns {Promise.<MovimentacaoConta>}
   */
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
      })
      .then(m => new MovimentacaoConta({ id: m.id })
        .fetch(_.merge({ withRelated: [ 'conta' ] }, options)));
  },
  /**
   * Insere transação a débito na conta e atualiza o saldo
   * @param credito {object} - detalhes da transação
   * @param credito.conta_id {number} - id da conta
   * @param credito.historico {string} - descrição detalhada
   * @param credito.tipo {string} - texto arbitrário que identifica o tipo
   * @param credito.valor {string} - valor positivo a creditar
   * @param options {object} - opções do knex
   * @param options.transacting {object} - transação ativa
   * @returns {Promise.<MovimentacaoConta>}
   */
  _inserirCredito: function(credito, options) {
    credito.valor = money.floatToAmount(credito.valor);
    if (money.cmp(credito.valor, '0.00') <= 0) {
      throw new AreaAzul.BusinessException(
        'Valor do crédito deve ser maior que zero',
        credito);
    }
    return MovimentacaoConta
      ._inserirMovimentacaoConta(credito, options);
  },
  /**
   * Insere transação na conta e atualiza o saldo
   * @param debito {object} - detalhes da transação
   * @param debito.conta_id {number} - id da conta
   * @param debito.historico {string} - descrição detalhada
   * @param debito.tipo {string} - texto arbitrário que identifica o tipo
   * @param debito.valor {string} - valor positivo a debitar
   * @param options {object} - opções do knex
   * @param options.transacting {object} - transação ativa
   * @returns {Promise.<MovimentacaoConta>}
   */
  _inserirDebito: function(debito, options) {
    debito.valor = money.floatToAmount(debito.valor);
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

const MovimentacoesConta = Bookshelf.Collection.extend({
  model: MovimentacaoConta
}, {
});
Bookshelf.collection('MovimentacoesConta', MovimentacoesConta);
