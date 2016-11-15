const Bookshelf = require('../../database');
const Pessoa = Bookshelf.model('Pessoa');

const Pessoas = Bookshelf.Collection.extend({
  model: Pessoa
});
Bookshelf.collection('Pessoas', Pessoas);

module.exports = Pessoas;
