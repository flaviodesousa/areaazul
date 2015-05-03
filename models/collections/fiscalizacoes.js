var Bookshelf = require('bookshelf').conexaoMain;
var Fiscalizacao = require("../models/fiscalizacao");
var moment = require('moment');

module.exports = Bookshelf.Collection.extend({
  model: Fiscalizacao,
  listar: function (params, then, fail) {
    this
      .query(function (qb) {
        if (params.since) {
          qb.where('timestamp', '>=',
            moment().subtract(params.since, 'hours')
            .calendar());
        }
        if (params.limit) {
          qb.limit(params.limit);
        }
        qb.orderBy('timestamp', 'desc');
      })
      .fetch()
      .then(function (c) {
        then(c);
      })
      .catch(function (err) {
        fail(err);
      });
  }
});
