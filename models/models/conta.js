'use strict';

const _ = require('lodash');
const Bookshelf = require('../../database');

var Conta = Bookshelf.Model.extend({
  tableName: 'conta',
  movimentacao: function() {
    return this.hasMany('MovimentacaoConta', 'conta_id');
  }
}, {
  _cadastrar: function(conta, options) {
    conta = _.merge({
      saldo: 0,
      data_abertura: new Date(),
      ativo: true }, conta || {});
    var optionsInsert = _.merge({ method: 'insert' }, options);
    return new Conta(conta)
      .save(null, optionsInsert);
  }
});
Bookshelf.model('Conta', Conta);

module.exports = Conta;
