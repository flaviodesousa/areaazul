'use strict';

var Bookshelf = require('bookshelf').conexaoMain;

var UsuarioHasVeiculo =  Bookshelf.Model.extend({
  tableName: 'usuario_has_veiculo',
  // Coluna id intruduzida por bug no Bookshelf
  idAttribute: 'id_usuario_has_veiculo',
  veiculo: function() {
    return this.belongsTo(require('./veiculo'), 'veiculo_id');
  },
  usuario: function() {
    return this.belongsTo(require('./usuario'), 'usuario_pessoa_id');
  },
}, {
});

module.exports = UsuarioHasVeiculo;
