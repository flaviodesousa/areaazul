const Bookshelf = require('../../database');
const PessoaFisica = Bookshelf.model('PessoaFisica');

const PessoasFisicas = Bookshelf.Collection.extend({
  model: PessoaFisica
});
Bookshelf.collection('PessoasFisicas', PessoasFisicas);

module.exports = PessoasFisicas;
