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
        var err = new AreaAzul.AuthenticationError(
          'Usuário: login inválido', { login: login });
        log.warn(err.message, err.details);
        throw err;
      }
      return bcrypt.compare(senha, usuario.get('senha'));
    })
    .then(function(valid) {
      if (!valid) {
        const authenticationError = new AreaAzul.AuthenticationError(
          'Usuário: senha incorreta', {
            login: login,
            usuario: usuario
          });
        log.warn(authenticationError.message, authenticationError.details);
        throw authenticationError;
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

module.exports.listaAtivacoes = (id, antesDe = new Date(), limite = 10) =>
  Usuario
    ._listaAtivacoes(id, antesDe, limite)
    .then(lista => lista.toJSON());

module.exports.listaVeiculos = (id, antesDe = new Date(), limite = 10) =>
  Usuario
    ._listaVeiculos(id, antesDe, limite)
    .then(lista => lista.toJSON());

module.exports.extratoFinanceiro = (id, antesDe = new Date(), limite = 10) =>
  Usuario
    ._extratoFinanceiro(id, antesDe, limite)
    .then(lista => lista.toJSON());
