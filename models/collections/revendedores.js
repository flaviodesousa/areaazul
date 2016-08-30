const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const Revendedor = Bookshelf.model('Revendedor');

var Revendedores = Bookshelf.Collection.extend({
  model: Revendedor
});
Bookshelf.collection('Revendedores', Revendedores);

module.exports = Revendedores;
