const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const PessoaJuridica = Bookshelf.model('PessoaJuridica');

var PessoasJuridicas = Bookshelf.Collection.extend({
  model: PessoaJuridica
});
Bookshelf.model('PessoasJuridicas', PessoasJuridicas);

module.exports = PessoasJuridicas;
