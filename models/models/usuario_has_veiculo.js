'use strict';

var Bookshelf = require('bookshelf').conexaoMain;
var Veiculo = require('./veiculo').Veiculo;
var Usuario = require('./usuario').Usuario;

var UsuarioHasVeiculo = Bookshelf.Model.extend({
  tableName: 'usuario_has_veiculo',
  idAttribute: ['usuario_pessoa_id', 'veiculo_id'],
  veiculo: function() {
    return this.belongsTo(Veiculo, 'veiculo_id');
  },
  usuario: function() {
    return this.belongsTo(Usuario, 'usuario_pessoa_id');
  },
});

module.exports = UsuarioHasVeiculo;
