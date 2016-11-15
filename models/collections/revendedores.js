const Bookshelf = require('../../database');
const Revendedor = Bookshelf.model('Revendedor');

const Revendedores = Bookshelf.Collection.extend({
  model: Revendedor
});
Bookshelf.collection('Revendedores', Revendedores);

module.exports = Revendedores;
