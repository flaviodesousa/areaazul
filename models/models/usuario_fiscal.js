'use strict';

const _ = require('lodash');
const bcrypt = require('bcrypt-then');
const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const log = AreaAzul.log;
const util = require('areaazul-utils');
const UsuarioHelper = require('../../helpers/usuario_helper');

const Usuario = Bookshelf.model('Usuario');
const PessoaFisica = Bookshelf.model('PessoaFisica');
const Conta = Bookshelf.model('Conta');

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
  cadastrar: function(camposUsuarioFiscal) {
    var pessoaFisica;
    var usuarioFiscal;
    var conta;

    return Bookshelf.transaction(function(t) {
      var options = { transacting: t };
      var optionsInsert = _.merge({ method: 'insert' }, options);
      return UsuarioFiscal
        ._camposValidos(camposUsuarioFiscal, null, options)
        .then(function(messages) {
          if (messages.length) {
            throw new AreaAzul
              .BusinessException(
              'Não foi possível cadastrar novo Usuário Fiscal.'
              + ' Dados inválidos',
              messages);
          }
        })
        .then(function() {
          return new UsuarioFiscal(
            { login: camposUsuarioFiscal.login })
            .fetch(options);
        })
        .then(function(u) {
          usuarioFiscal = u;
          return new PessoaFisica({ cpf: camposUsuarioFiscal.cpf })
            .fetch(options)
        })
        .then(function(pf) {
          if (!pf) {
            return PessoaFisica._cadastrar(
              camposUsuarioFiscal, options);
          }
          return pf;
        })
        .then(function(pf) {
          pessoaFisica = pf;
          return Conta._cadastrar(null, options);
        })
        .then(function(c) {
          conta = c;
          return bcrypt.hash(camposUsuarioFiscal.nova_senha);
        })
        .then(function(hash) {
          return new UsuarioFiscal({
            id: pessoaFisica.id,
            login: camposUsuarioFiscal.login,
            senha: hash,
            conta_id: conta.id,
            ativo: true
          })
            .save(null, optionsInsert);
        });
    });
  },
  autorizado: function(login, senha) {
    var usuarioFiscal;
    return new UsuarioFiscal({ login: login })
      .fetch()
      .then(function(ur) {
        usuarioFiscal = ur;
        if (!usuarioFiscal) {
          var err = new AreaAzul.AuthenticationError(
            'UsuarioFiscal: login invalido',
            { login: login });
          log.warn(err.message, err.details);
          throw err;
        }
        return bcrypt.compare(senha, usuarioFiscal.get('senha'));
      })
      .then(function(valid) {
        if (valid) {
          return usuarioFiscal;
        }
        var err = new AreaAzul.BusinessException(
          'UsuarioFiscal: senha incorreta',
          { login: login });
        log.warn(err.message, err.details);
        throw err;
      });
  },
  buscarPorId: function(id) {
    return new UsuarioFiscal({ id: id })
      .fetch()
      .then(function(u) {
        if (u) {
          return u;
        }
        var err = new AreaAzul.BusinessException(
          'UsuarioFiscal: id nao encontrado',
          { id: id });
        log.warn(err.message, err.details);
        throw err;
      });
  }
});
Bookshelf.model('UsuarioFiscal', UsuarioFiscal);

module.exports = UsuarioFiscal;
