const log = require('../logging');
const Bookshelf = require('../database');
const PessoaFisica = Bookshelf.model('PessoaFisica');

module.exports.cadastrar = function(camposPessoaFisica) {
  log.info('cadastrar()', camposPessoaFisica);

  return Bookshelf.transaction(function(t) {
    return PessoaFisica
      ._cadastrar(camposPessoaFisica, { transacting: t })
      .then(pessoaFisica => {
        return pessoaFisica.toJSON();
      });
  });
};

module.exports.buscarPorCPF = function(cpf) {
  return Bookshelf.transaction(function(t) {
    return PessoaFisica
      ._buscarPorCPF(cpf, { transacting: t })
      .then(pessoaFisica => {
        if (!pessoaFisica) {
          return null;
        }
        return pessoaFisica.toJSON();
      });
  });
};
