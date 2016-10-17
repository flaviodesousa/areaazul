const Bookshelf = require('../database');
const UsuarioHasVeiculo = Bookshelf.model('UsuarioHasVeiculo');

module.exports.cadastrar = function(usuarioHasVeiculo) {
  return Bookshelf.transaction(
    function(t) {
      return UsuarioHasVeiculo
        ._salvar(usuarioHasVeiculo, { transacting: t })
        .then(uhv => uhv.toJSON());
    });
};
