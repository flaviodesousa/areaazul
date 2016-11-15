const Bookshelf = require('../database');
const Estados = Bookshelf.collection('Estados');

module.exports.listar = function() {
  return new Estados()
    .orderBy('nome')
    .fetch()
    .then(estados => {
      return estados.toJSON();
    });
};
