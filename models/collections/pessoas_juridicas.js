const Bookshelf = require('../../database');
const PessoaJuridica = Bookshelf.model('PessoaJuridica');

var PessoasJuridicas = Bookshelf.Collection.extend({
  model: PessoaJuridica
});
Bookshelf.collection('PessoasJuridicas', PessoasJuridicas);

module.exports = PessoasJuridicas;
