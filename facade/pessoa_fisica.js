const log = require('../logging');
const Bookshelf = require('../database');
const PessoaFisica = Bookshelf.model('PessoaFisica');

module.exports.cadastrar = function(pessoaFisica) {
  log.info('cadastrar()', pessoaFisica);

  return Bookshelf.transaction(function(t) {
    return PessoaFisica
      ._cadastrar(pessoaFisica, { transacting: t });
  });
};

module.exports.buscarPorCPF = function(cpf) {
  return Bookshelf.transaction(function(t) {
    return PessoaFisica._buscarPorCPF(cpf, { transacting: t });
  });
};
