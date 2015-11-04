'use strict';

var Bookshelf = require('bookshelf').conexaoMain;
var Fiscalizacao = require('../models/fiscalizacao');
var moment = require('moment');

module.exports = Bookshelf.Collection.extend({
  model: Fiscalizacao,
}, {
  listar: function(parameters, then, fail) {
    this
      .query(function(qb) {
        var params = parameters || {};
        if (params.minutos) {
          qb.where('timestamp', '>=',
            moment().subtract(params.minutos, 'minutes')
            .calendar());
        }
        if (params.limite) {
          qb.limit(params.limite);
        }
        qb.orderBy('timestamp', 'desc');
      })
      .fetch()
      .then(function(c) {
        then(c);
      })
      .catch(function(err) {
        fail(err);
      });
  },

});
