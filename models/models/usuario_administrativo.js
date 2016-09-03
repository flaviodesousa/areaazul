'use strict';

const _ = require('lodash');
const bcrypt = require('bcrypt-then');
const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
var log = AreaAzul.log;
var util = require('../../helpers/util');

const PessoaFisica = Bookshelf.model('PessoaFisica');

var UsuarioAdministrativo = Bookshelf.Model.extend({
  tableName: 'usuario_administrativo',
  pessoaFisica: function() {
    return this.hasOne('PessoaFisica', 'id');
  }
}, {
  cadastrar: function(user) {
    var UsuarioAdministrativo = this;
    var login;
    var senha;
    var pessoaFisica;

    if (!user.login) {
      login = user.cpf;
    } else {
      login = user.login;
    }

    return Bookshelf.transaction(function(t) {
      var options = { transacting: t };
      var optionsInsert = _.merge({}, options, { method: 'insert' });
      return new PessoaFisica({ cpf: user.cpf })
        .fetch(options)
        .then(function(pf) {
          if (!pf) {
            return PessoaFisica._cadastrar(user, options);
          }
          return pf;
        })
        .then(function(pf) {
          pessoaFisica = pf;
          return bcrypt.hash(user.senha);
        })
        .then(function(hash) {
          senha = hash;
          return new UsuarioAdministrativo({
              id: pf.id,
              login: login,
              senha: senha,
              autorizacao: user.autorizacao,
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
