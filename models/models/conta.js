'use strict';

var _ = require('lodash');
const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;

var Conta = Bookshelf.Model.extend({
  tableName: 'conta'
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
