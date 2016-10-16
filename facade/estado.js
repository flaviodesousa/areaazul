const Bookshelf = require('../database');
var Estados = Bookshelf.collection('Estados');

module.exports.listar = function() {
  return new Estados()
    .orderBy('nome')
    .fetch()
    .then(estados => {
      return estados.toJSON();
    });
};
