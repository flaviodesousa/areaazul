const _ = require('lodash');
const bcrypt = require('bcrypt-then');
const log = require('../logging');
const AreaAzul = require('../areaazul');
const Bookshelf = require('../database');
const PessoaFisica = Bookshelf.model('PessoaFisica');
const UsuarioAdministrativo = Bookshelf.model('UsuarioAdministrativo');

module.exports.cadastrar = function(camposUsuarioAdministrativo) {
  var pessoaFisica;

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
      })
      .then(usuarioAdministrativo => {
        return usuarioAdministrativo.toJSON();
      });
  });
};

module.exports.autorizado = function(login, senha) {
  var usuarioAdministrativo;
  return new UsuarioAdministrativo({ login: login })
    .fetch()
    .then(function(ur) {
      usuarioAdministrativo = ur;
      if (!usuarioAdministrativo) {
        var err = new AreaAzul.AuthenticationError(
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
          ._buscarPorId(usuarioAdministrativo.id, null)
          .then(usuAdm => {
            return usuAdm.toJSON();
          });
      }
      const err = new AreaAzul.AuthenticationError(
        'Usuário administrativo: senha incorreta', {
          login: login,
          usuario: usuarioAdministrativo
        });
      log.warn(err.message, err.details);
      throw err;
    });
};

module.exports.buscarPorId = function(id) {
  return UsuarioAdministrativo
    ._buscarPorId(id, null)
    .then(usuAdm => {
      return usuAdm.toJSON();
    });
};
