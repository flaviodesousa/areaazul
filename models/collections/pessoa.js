const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const Pessoa = Bookshelf.model('Pessoa');

var Pessoas = Bookshelf.Collection.extend({
  model: Pessoa
});
Bookshelf.collection('Pessoas', Pessoas);

module.exports = Pessoas;
