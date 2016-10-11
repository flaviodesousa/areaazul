const Bookshelf = require('../database');
const UsuarioHasVeiculo = Bookshelf.model('UsuarioHasVeiculo');

module.export.cadastrar = function(usuarioHasVeiculo) {
  return Bookshelf.transaction(
    function(t) {
      return UsuarioHasVeiculo
        ._salvar(usuarioHasVeiculo, { transacting: t });
    });
};
