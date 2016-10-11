'use strict';

const Bookshelf = require('../../database');
const UsuarioHelper = require('../../helpers/usuario_helper');

var UsuarioAdministrativo = Bookshelf.Model.extend({
  tableName: 'usuario_administrativo',
  pessoaFisica: function() {
    return this.hasOne('PessoaFisica', 'id');
  }
}, {
  _camposValidos: function(
    camposUsuarioAdministrativo, usuarioAdministrativo, options) {
    var messages = [];

    return UsuarioHelper
      ._camposValidos(
        camposUsuarioAdministrativo, usuarioAdministrativo,
        UsuarioAdministrativo, options)
      .then(function(messagesUsuarioHelper) {
        return messages.concat(messagesUsuarioHelper);
      });
  }
});
Bookshelf.model('UsuarioAdministrativo', UsuarioAdministrativo);

module.exports = UsuarioAdministrativo;
