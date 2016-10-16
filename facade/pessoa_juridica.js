const Bookshelf = require('../database');
const PessoaJuridica = Bookshelf.model('PessoaJuridica');

module.exports.cadastrar = function(camposPessoaJuridica) {
  return Bookshelf.transaction(function(t) {
    return PessoaJuridica
      ._cadastrar(camposPessoaJuridica, { transacting: t })
      .then(pessoaJuridica => {
        return pessoaJuridica.toJSON();
      });
  });
};
