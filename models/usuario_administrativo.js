'use strict';

const _ = require('lodash');
const bcrypt = require('bcrypt-then');
const log = require('../logging');
const Bookshelf = require('../database');

const AreaAzul = require('../areaazul');
const PessoaFisica = Bookshelf.model('PessoaFisica');

const UsuarioHelper = require('../helpers/usuario_helper');

const UsuarioAdministrativo = Bookshelf.Model.extend({
  tableName: 'usuario_administrativo',
  pessoaFisica: function() {
    return this.hasOne('PessoaFisica', 'id');
  }
}, {


  _cadastrar: (camposUsuarioAdministrativo, options) => {
    let pessoaFisica;
    const optionsInsert = _.merge({ method: 'insert' }, options);
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
          .fetch(_.merge({ require: true }, options));
      })
      .then(function(u) {
        throw new AreaAzul.BusinessException(
          'Usuário administrativo: alteração ainda não suportada',
          { usuarioAdministrativo: u }
        );
      })
      .catch(Bookshelf.NotFoundError, () => {
        return new PessoaFisica({ cpf: camposUsuarioAdministrativo.cpf })
          .fetch(options);
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
      })
      .then(usuarioAdministrativo => {
        return UsuarioAdministrativo
          ._buscarPorId(usuarioAdministrativo.id, options);
      });
  },


  _autentico: (login, senha) => {
    let usuarioAdministrativo;
    return new UsuarioAdministrativo({ login: login })
      .fetch()
      .then(function(ur) {
        usuarioAdministrativo = ur;
        if (!usuarioAdministrativo) {
          const err = new AreaAzul.AuthenticationError(
            'Usuário administrativo: login inválido',
            { login: login });
          log.warn(err.message, err.details);
          throw err;
        }
        return bcrypt.compare(senha, usuarioAdministrativo.get('senha'));
      })
      .then(function(valid) {
        if (valid) {
          return UsuarioAdministrativo
            ._buscarPorId(usuarioAdministrativo.id, null);
        }
        const err = new AreaAzul.AuthenticationError(
          'Usuário administrativo: senha incorreta', {
            login: login,
            usuario: usuarioAdministrativo
          });
        log.warn(err.message, err.details);
        throw err;
      });
  },


  _camposValidos: function(camposUsuAdm, usuarioAdministrativo, options) {
    let messages = [];

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
