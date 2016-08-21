'use strict';

var _ = require('lodash');
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
      var optionsInsert = _.merge({}, options, { method: 'insert' });
      return PessoaFisica
        .forge({ cpf: user.cpf })
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
    var UsuarioAdministrativo = this;
    var err;
    return UsuarioAdministrativo
      .forge({ login: login })
      .fetch()
      .then(function(usuarioAdministrativo) {
        if (usuarioAdministrativo === null) {
          err = new AreaAzul.BusinessException(
            'UsuarioAdministrativo: login invalido',
            { login: login });
          log.warn(err.message, err.details);
          throw err;
        }
        if (util.senhaValida(senha, usuarioAdministrativo.get('senha'))) {
          return usuarioAdministrativo;
        }
        err = new AreaAzul.BusinessException(
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
