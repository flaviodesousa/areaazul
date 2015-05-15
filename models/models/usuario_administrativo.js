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
        ._cadastrar(user, options)
        .then(function(pf) {
          user = _.merge(user, {
          });
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
  autorizado: function(login, senha) {
    var UsuarioFiscal = this;
    var err;
    return UsuarioFiscal
      .forge({login: login})
      .fetch()
      .then(function(usuarioFiscal) {
        if (usuarioFiscal === null) {
          err = new Error('login invalido: ' + login);
          err.authentication_event = true;
          throw err;
        }
        if (util.senhaValida(senha, usuarioFiscal.get('senha'))) {
          return usuarioFiscal;
        } else {
          err = new Error('senha incorreta');
          err.authentication_event = true;
          throw err;
        }
      });
  },
});

exports = UsuarioAdministrativo;
