const Bookshelf = require('../../database');
const Revendedor = Bookshelf.model('Revendedor');

var Revendedores = Bookshelf.Collection.extend({
  model: Revendedor
});
Bookshelf.collection('Revendedores', Revendedores);

module.exports = Revendedores;
