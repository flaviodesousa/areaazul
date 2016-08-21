'use strict';

const AreaAzul = require('../../areaazul');
var Bookshelf = AreaAzul.db;
var Cidade = Bookshelf.model('Cidade');

var Cidades = Bookshelf.Collection.extend({
  model: Cidade,
}, {
  listar: function(idEstado) {
    return this
    .forge()
    .query(function(qb) {
      qb.where('estado_id', '=', idEstado);
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
Bookshelf.collection('Cidades', Cidades);

module.exports = Cidades;
