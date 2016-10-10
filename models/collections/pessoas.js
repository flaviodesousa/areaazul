const Bookshelf = require('../../database');
const Pessoa = Bookshelf.model('Pessoa');

var Pessoas = Bookshelf.Collection.extend({
  model: Pessoa
});
Bookshelf.collection('Pessoas', Pessoas);

module.exports = Pessoas;
