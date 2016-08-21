'use strict';

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
var Fiscalizacao = Bookshelf.model('Fiscalizacao');
var moment = require('moment');

var Fiscalizacoes = Bookshelf.Collection.extend({
  model: Fiscalizacao
}, {
  listar: function(parameters) {
    return this
      .query(function(qb) {
        var params = parameters || {};
        if (params.minutos) {
          qb.where('timestamp', '>=',
            moment().subtract(params.minutos, 'minutes').calendar());
        }
        if (params.limite) {
          qb.limit(params.limite);
        }
        qb.orderBy('timestamp', 'desc');
      })
      .fetch();
  }
});
Bookshelf.collection('Fiscalizacoes', Fiscalizacoes);

module.exports = Fiscalizacoes;
