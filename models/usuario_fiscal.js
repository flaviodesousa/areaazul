'use strict';

const _ = require('lodash');
const bcrypt = require('bcrypt-then');
const log = require('../logging');
const AreaAzul = require('../areaazul');
const Bookshelf = require('../database');
const PessoaFisica = Bookshelf.model('PessoaFisica');
const Conta = Bookshelf.model('Conta');
const UsuarioHelper = require('../helpers/usuario_helper');

const UsuarioFiscal = Bookshelf.Model.extend({
  tableName: 'usuario_fiscal',
  pessoaFisica: function() {
    return this.hasOne('PessoaFisica', 'id');
  }
}, {


  _cadastrar: (camposUsuarioFiscal, options) => {
    let conta;
    const optionsInsert = _.merge({ method: 'insert' }, options);
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
        let pessoaFisica;
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
          })
          .then(usuarioFiscal => {
            return UsuarioFiscal
              ._buscarPorId(usuarioFiscal.id, options);
          });
      });
  },


  _autentico: (login, senha) => {
    let usuarioFiscal;
    return new UsuarioFiscal({ login: login })
      .fetch()
      .then(function(ur) {
        usuarioFiscal = ur;
        if (!usuarioFiscal) {
          const err = new AreaAzul.AuthenticationError(
            'Usuário fiscal: login inválido',
            { login: login });
          log.warn(err.message, err.details);
          throw err;
        }
        return bcrypt.compare(senha, usuarioFiscal.get('senha'));
      })
      .then(function(valid) {
        if (valid) {
          return UsuarioFiscal
            ._buscarPorId(usuarioFiscal.id, {});
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


  _camposValidos: function(camposUsuarioFiscal, usuarioFiscal, options) {
    let messages = [];

    return UsuarioHelper
      ._camposValidos(
        camposUsuarioFiscal, usuarioFiscal,
        UsuarioFiscal, options)
      .then(function(messagesUsuarioHelper) {
        return messages.push.apply(messages, messagesUsuarioHelper);
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

const UsuariosFiscais = Bookshelf.Collection.extend({
  model: UsuarioFiscal
});
Bookshelf.collection('UsuariosFiscais', UsuariosFiscais);
