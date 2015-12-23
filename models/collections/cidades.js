'use strict';

var Bookshelf = require('bookshelf').conexaoMain;
var Cidade = require("../models/cidade");

var CidadeCollection = Bookshelf.Collection.extend({
  model: Cidade,
}, {
  listar: function(id_estado) {
    return this
    .forge()
    .query(function(qb) {
      qb.where('estado_id', '=', id_estado);
      qb.select('cidade.*');
    })
    .fetch()
    .then(function(collection) {
      return collection;
    })
    .catch(function(e) {
      return e;
    });
  },
});

module.exports = CidadeCollection;
