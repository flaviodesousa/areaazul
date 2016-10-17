'use strict';

const _ = require('lodash');
const log = require('../../logging');
const AreaAzul = require('../../areaazul');
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
  },
  _buscarPorId: function(id, options) {
    return new UsuarioFiscal({ id: id })
      .fetch(_.merge({
        require: true,
        withRelated: [ 'pessoaFisica', 'pessoaFisica.pessoa' ]
      }, options))
      .catch(Bookshelf.NotFoundError, () => {
        const err = new AreaAzul.BusinessException(
          'Usuário fiscal: id não encontrado',
          { id: id });
        log.warn(err.message, err.details);
        throw err;
      });
  }
});
Bookshelf.model('UsuarioFiscal', UsuarioFiscal);

module.exports = UsuarioFiscal;
