'use strict';

const _ = require('lodash');
const Bookshelf = require('../database');
const moment = require('moment');

const Conta = Bookshelf.Model.extend({
  tableName: 'conta',
  movimentacao: function() {
    return this.hasMany('MovimentacaoConta', 'conta_id');
  }
}, {
  _cadastrar: function(conta, options) {
    conta = _.merge({
      saldo: 0,
      data_abertura: moment().utc(),
      ativo: true }, conta || {});
    const optionsInsert = _.merge({ method: 'insert' }, options);
    return new Conta(conta)
      .save(null, optionsInsert);
  }
});
Bookshelf.model('Conta', Conta);

const Contas = Bookshelf.Collection.extend({
  model: Conta
});
Bookshelf.collection('Contas', Contas);
