'use strict';

const Bookshelf = require('../../database');
var Estado = Bookshelf.model('Estado');

var Estados = Bookshelf.Collection.extend({
  model: Estado
}, {
  listar: function() {
    return new Estados()
      .orderBy('nome')
      .fetch();
  }
});
Bookshelf.collection('Estados', Estados);

module.exports = Estados;
