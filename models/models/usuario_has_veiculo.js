'use strict';

var Bookshelf = require('bookshelf').conexaoMain;

var UsuarioHasVeiculo =  Bookshelf.Model.extend({
  tableName: 'usuario_has_veiculo',
  idAttribute: ['usuario_pessoa_id', 'veiculo_id'],
  veiculo: function() {
    return this.belongsTo(require('./veiculo'), 'veiculo_id');
  },
  usuario: function() {
    return this.belongsTo(require('./usuario'), 'usuario_pessoa_id');
  },
}, {
});

module.exports = UsuarioHasVeiculo;
