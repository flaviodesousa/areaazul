const Bookshelf = require('../database');
const PessoaJuridica = Bookshelf.model('PessoaJuridica');

module.export.cadastrar = function(camposPessoaJuridica) {
  return Bookshelf.transaction(function(t) {
    return PessoaJuridica
      ._cadastrar(camposPessoaJuridica, { transacting: t });
  });
};
