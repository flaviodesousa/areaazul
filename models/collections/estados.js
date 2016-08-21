'use strict';

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
var Estado = Bookshelf.model('Estado');

var Estados = Bookshelf.Collection.extend({
  model: Estado,
}, {
  listar: function(func) {
    return new Estados()
      .query()
      .order('nome')
      .fetch();
  },
});
Bookshelf.collection('Estados', Estados);

module.exports = Estados;
