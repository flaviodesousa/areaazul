const bcrypt = require('bcrypt-then');

const log = require('../logging');
const Bookshelf = require('../database');
const Usuario = Bookshelf.model('Usuario');
const AreaAzul = require('../areaazul');
const AreaazulUtils = require('areaazul-utils');

module.exports.buscarPorId = function(id) {
  return Usuario
    .forge({ id: id })
    .fetch({
      require: true,
      withRelated: [ 'pessoaFisica', 'pessoaFisica.pessoa' ] })
    .then(function(u) {
      if (u) {
        return u;
      }
      var err = new AreaAzul.BusinessException(
        'Usuário: id não encontrado', {
          id: id
        });
      log.warn(err.message, err.details);
      throw err;
    });
};

module.exports.autentico = function(login, senha) {
  var usuario;
  return new Usuario({ login: login })
    .fetch()
    .then(function(u) {
      usuario = u;
      if (!usuario) {
        var err = new AreaAzul.BusinessException(
          'Usuário: login inválido', { login: login });
        err.authentication_event = true;
        log.warn(err.message, err.details);
        throw err;
      }
      return bcrypt.compare(senha, usuario.get('senha'));
    })
    .then(function(valid) {
      if (!valid) {
        throw new AreaAzul.AuthenticationError(
          'Usuário: senha incorreta', {
            login: login,
            usuario: usuario
          });
      }
      return usuario;
    });
};

module.exports.inserir = function(camposUsuario) {
  return Bookshelf.transaction(function(t) {
    return Usuario
      ._salvar(camposUsuario, null, { transacting: t })
      .catch(AreaAzul.BusinessException, e => {
        e.details = AreaazulUtils.semSenhas(e.details);
        throw e;
      })
      .then(usuario => {
        return usuario.toJSON();
      });
  });
};

module.exports.alterar = function(camposUsuario, usuario) {
  return Bookshelf.transaction(function(t) {
    return Usuario
      ._salvar(camposUsuario, usuario, { transacting: t })
      .then(usuario => {
        return usuario.toJSON();
      });
  });
};

module.exports.alterarSenha = function(camposAlterarSenha) {
  return Bookshelf.transaction(function(t) {
    return Usuario
      ._alterarSenha(camposAlterarSenha, { transacting: t })
      .then(usuario => {
        return usuario.toJSON();
      });
  });
};

module.exports.getAtivacoes = () => {};
module.exports.getVeiculos = () => {};
module.exports.getSaldo = () => {};
module.exports.getHistorico = () => {};
