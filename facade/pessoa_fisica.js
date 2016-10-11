const log = require('../logging');
const Bookshelf = require('../database');
const PessoaFisica = Bookshelf.model('PessoaFisica');

module.export.cadastrar = function(pessoaFisica) {
  log.info('cadastrar()', pessoaFisica);
  var PessoaFisica = this;

  return Bookshelf.transaction(function(t) {
    return PessoaFisica
      ._cadastrar(pessoaFisica, { transacting: t });
  });
};

module.export.buscarPorCPF = function(cpf) {
  return Bookshelf.transaction(function(t) {
    return PessoaFisica._buscarPorCPF(cpf, { transacting: t });
  });
};
