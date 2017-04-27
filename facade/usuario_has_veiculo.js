const Bookshelf = require('../database');
const UsuarioHasVeiculo = Bookshelf.model('UsuarioHasVeiculo');

module.exports.cadastrar = function(usuarioHasVeiculo) {
  return Bookshelf.transaction(t =>
    UsuarioHasVeiculo
      ._salvar(usuarioHasVeiculo, { transacting: t })
      .then(uhv => uhv.toJSON())
  );
};
