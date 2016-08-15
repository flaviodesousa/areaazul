'use strict';

var _ = require('lodash');
var AreaAzul = require('../../areaazul');
var Bookshelf = AreaAzul.db.Bookshelf.conexaoMain;

var Conta = Bookshelf.Model.extend({
  tableName: 'conta',
  idAttribute: 'id_conta'
}, {
  _cadastrar: function(conta, options) {
    conta = _.merge(conta || {}, { saldo: 0, ativo: true });
    var optionsInsert = _.merge({ method: 'insert' }, options);
    return new Conta(conta)
      .save(null, optionsInsert);
  }
});

module.exports = Conta;