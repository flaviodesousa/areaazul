var Bookshelf = require('bookshelf').conexaoMain;

var UsuarioHasVeiculo = Bookshelf.Model.extend({
  tableName: 'usuario_has_veiculo',
  idAttribute: ['usuario_id', 'veiculo_id'],
});

module.exports = UsuarioHasVeiculo;
