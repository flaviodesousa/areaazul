'use strict';

const _ = require('lodash');
const bcrypt = require('bcrypt-then');
const AreaAzul = require('../../areaazul');
const Bookshelf = require('../../database');
const log = require('../../logging');
const UsuarioHelper = require('../../helpers/usuario_helper');

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
            .fetch(_.merge({ require: true }, options));
        })
        .then(function(u) {
          throw new AreaAzul.BusinessException(
            'Alteração de usuário fiscal: ainda não suportada',
            { usuario: u });
        })
        .catch(Bookshelf.NotFoundError, () => {
          // Novo usuário fiscal
          var pessoaFisica;
          return new PessoaFisica({ cpf: camposUsuarioFiscal.cpf })
            .fetch(_.merge({ require: true }, options))
            .catch(Bookshelf.NotFoundError, () => {
              return PessoaFisica
                ._cadastrar(camposUsuarioFiscal, options);
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
            'Usuário fiscal: login inválido',
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
        const err = new AreaAzul.AuthenticationError(
          'Usuário fiscal: senha incorreta', {
            login: login,
            usuario: usuarioFiscal
          });
        log.warn(err.message, err.details);
        throw err;
      });
  },
  buscarPorId: function(id) {
    return new UsuarioFiscal({ id: id })
      .fetch({ require: true })
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
