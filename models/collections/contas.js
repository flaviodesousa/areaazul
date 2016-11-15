const Bookshelf = require('../../database');
const Conta = Bookshelf.model('Conta');

const Contas = Bookshelf.Collection.extend({
  model: Conta
});
Bookshelf.collection('Contas', Contas);

module.exports = Contas;
