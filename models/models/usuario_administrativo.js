'use strict';

const _ = require('lodash');
const bcrypt = require('bcrypt-then');
const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
var log = AreaAzul.log;
var util = require('../../helpers/util');
const UsuarioHelper = require('../../helpers/usuario_helper');

const Usuario = Bookshelf.model('Usuario');
const PessoaFisica = Bookshelf.model('PessoaFisica');

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
  },
  cadastrar: function(camposUsuarioAdministrativo) {
    var pessoaFisica;
    var usuarioAdministrativo;

    return Bookshelf.transaction(function(t) {
      var options = { transacting: t };
      var optionsInsert = _.merge({ method: 'insert' }, options);
      return UsuarioAdministrativo
        ._camposValidos(camposUsuarioAdministrativo, null, options)
        .then(function(messages) {
          if (messages.length) {
            throw new AreaAzul
              .BusinessException(
              'Não foi possível cadastrar novo Usuário Administrativo.'
              + ' Dados inválidos',
              messages);
          }
        })
        .then(function() {
          return new UsuarioAdministrativo(
            { login: camposUsuarioAdministrativo.login })
            .fetch(options);
        })
        .then(function(u) {
          usuarioAdministrativo = u;
          return new PessoaFisica({ cpf: camposUsuarioAdministrativo.cpf })
            .fetch(options)
        })
        .then(function(pf) {
          if (!pf) {
            return PessoaFisica._cadastrar(
              camposUsuarioAdministrativo, options);
          }
          return pf;
        })
        .then(function(pf) {
          pessoaFisica = pf;
          return bcrypt.hash(camposUsuarioAdministrativo.nova_senha);
        })
        .then(function(hash) {
          return new UsuarioAdministrativo({
              id: pessoaFisica.id,
              login: camposUsuarioAdministrativo.login,
              senha: hash,
              autorizacao: camposUsuarioAdministrativo.autorizacao,
              ativo: true
            })
            .save(null, optionsInsert);
        });
    });
  },
  autorizado: function(login, senha) {
    var usuarioAdministrativo;
    return new UsuarioAdministrativo({ login: login })
      .fetch()
      .then(function(ur) {
        usuarioAdministrativo = ur;
        if (!usuarioAdministrativo) {
          var err = new AreaAzul.AuthenticationError(
            'UsuarioAdministrativo: login invalido',
            { login: login });
          log.warn(err.message, err.details);
          throw err;
        }
        return bcrypt.compare(senha, usuarioAdministrativo.get('senha'));
      })
      .then(function(valid) {
        if (valid) {
          return usuarioAdministrativo;
        }
        var err = new AreaAzul.BusinessException(
          'UsuarioAdministrativo: senha incorreta',
          { login: login });
        log.warn(err.message, err.details);
        throw err;
      });
  },
  buscarPorId: function(id) {
    return new UsuarioAdministrativo({ id: id })
      .fetch()
      .then(function(u) {
        if (u) {
          return u;
        }
        var err = new AreaAzul.BusinessException(
          'UsuarioAdministrativo: id nao encontrado',
          { id: id });
        log.warn(err.message, err.details);
        throw err;
      });
  }
});
Bookshelf.model('UsuarioAdministrativo', UsuarioAdministrativo);

module.exports = UsuarioAdministrativo;
