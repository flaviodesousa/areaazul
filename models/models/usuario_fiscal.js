'use strict';

const Bookshelf = require('../../database');
const UsuarioHelper = require('../../helpers/usuario_helper');

var UsuarioFiscal = Bookshelf.Model.extend({
  tableName: 'usuario_fiscal',
  pessoaFisica: function() {
    return this.hasOne('PessoaFisica', 'id');
  }
}, {
  _camposValidos: function(
    camposUsuarioFiscal, usuarioFiscal, options) {
    var messages = [];

    return UsuarioHelper
      ._camposValidos(
        camposUsuarioFiscal, usuarioFiscal,
        UsuarioFiscal, options)
      .then(function(messagesUsuarioHelper) {
        return messages.concat(messagesUsuarioHelper);
      });
  }
});
Bookshelf.model('UsuarioFiscal', UsuarioFiscal);

module.exports = UsuarioFiscal;
