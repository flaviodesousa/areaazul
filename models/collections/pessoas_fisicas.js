const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const PessoaFisica = Bookshelf.model('PessoaFisica');

var PessoasFisicas = Bookshelf.Collection.extend({
  model: PessoaFisica
});
Bookshelf.collection('PessoasFisicas', PessoasFisicas);

module.exports = PessoasFisicas;
