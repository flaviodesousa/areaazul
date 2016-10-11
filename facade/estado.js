const Bookshelf = require('../database');
var Estados = Bookshelf.collection('Estados');

module.export.listar = function() {
  return new Estados()
    .orderBy('nome')
    .fetch();
};
