'use strict';

var _ = require('lodash');
var Bookshelf = require('bookshelf').conexaoMain;
var PessoaFisica = require('./pessoafisica').PessoaFisica;
var util = require('./util');

var UsuarioAdministrativo = Bookshelf.Model.extend({
  tableName: 'usuario_administrativo',
  idAttribute: 'pessoa_id',
  pessoaFisica: function() {
    return this.hasOne(PessoaFisica, 'pessoa_id');
  },
}, {
  cadastrar: function(user) {
    var UsuarioAdministrativo = this;
    var login;
    var senha;
    var senhaGerada;

    if (!user.senha) {
      senhaGerada = util.generate();
      senha = util.criptografa(senhaGerada);
    } else {
      senha = util.criptografa(user.senha);
    }

    if (!user.login) {
      login = user.cpf;
    } else {
      login = user.login;
    }

    return Bookshelf.transaction(function(t) {
      var options = { transacting: t };
      var optionsInsert = _.merge(options, { method: 'insert' });
      return PessoaFisica
        .forge({cpf: user.cpf})
        .fetch()
        .then(function(pf) {
          if (!pf) {
            return PessoaFisica._cadastrar(user, options);
          }
          return pf;
        })
        .then(function(pf) {
          return UsuarioAdministrativo
            .forge({
              pessoa_id: pf.id,
              login: login,
              senha: senha,
              autorizacao: user.autorizacao,
              ativo: true,
            })
            .save(null, optionsInsert);
        });
    });
  },
  buscarPorId: function(id) {
    return UsuarioAdministrativo
      .forge({pessoa_id: id})
      .fetch({require: true});
  },
  autorizado: function(login, senha) {
    var UsuarioAdministrativo = this;
    var err;
    return UsuarioAdministrativo
      .forge({login: login})
      .fetch()
      .then(function(usuarioAdministrativo) {
        if (usuarioAdministrativo === null) {
          err = new Error('login invalido: ' + login);
          err.authentication_event = true;
          throw err;
        }
        if (util.senhaValida(senha, usuarioAdministrativo.get('senha'))) {
          return usuarioAdministrativo;
        } else {
          err = new Error('senha incorreta');
          err.authentication_event = true;
          throw err;
        }
      });
  },
});

module.exports = UsuarioAdministrativo;
