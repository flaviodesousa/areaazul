'use strict';

const _ = require('lodash');
const Bookshelf = require('../../database');
const AreaAzul = require('../../areaazul');
const UsuarioHelper = require('../../helpers/usuario_helper');

const log = require('../../logging');

var UsuarioAdministrativo = Bookshelf.Model.extend({
  tableName: 'usuario_administrativo',
  pessoaFisica: function() {
    return this.hasOne('PessoaFisica', 'id');
  }
}, {
  _camposValidos: function(camposUsuAdm, usuarioAdministrativo, options) {
    var messages = [];

    return UsuarioHelper
      ._camposValidos(
        camposUsuAdm, usuarioAdministrativo,
        UsuarioAdministrativo, options)
      .then(function(messagesUsuarioHelper) {
        return messages.push.apply(messages, messagesUsuarioHelper);
      });
  },
  _buscarPorId: function(id, options) {
    return new UsuarioAdministrativo({ id: id })
      .fetch(_.merge({
        require: true,
        withRelated: [ 'pessoaFisica', 'pessoaFisica.pessoa' ]
      }, options))
      .catch(Bookshelf.NotFoundError, () => {
        const err = new AreaAzul.BusinessException(
          'Usuario administrativo: id não encontrado',
          { id: id });
        log.warn(err.message, err.details);
        throw err;
      });
  }
});
Bookshelf.model('UsuarioAdministrativo', UsuarioAdministrativo);

module.exports = UsuarioAdministrativo;
