var bcrypt = require('bcrypt-then');

const AreaAzul = require('../areaazul');
const Bookshelf = require('../database');
const log = require('../logging');

const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
const UsuariosRevendedores = Bookshelf.collection('UsuariosRevendedores');

module.exports.listarUsuarioRevenda = function(idRevendedor) {
  return new UsuariosRevendedores()
    .query({ where: { revendedor_id: idRevendedor } })
    .fetch({ withRelated: [
      'revendedor', 'pessoaFisica', 'pessoaFisica.pessoa' ] })
    .then(lista => lista.toJSON());
};
module.exports.autorizado = function(login, senha) {
  var usuarioRevendedor;
  return new UsuarioRevendedor({ login: login })
    .fetch({
      require: true,
      withRelated: [
        'revendedor', 'pessoaFisica', 'pessoaFisica.pessoa' ] })
    .catch(Bookshelf.NotFoundError, () => {
      const err = new AreaAzul.AuthenticationError(
        'Usuário revendedor: login inválido', {
          login: login
        });
      log.warn(err.message, err.details);
      throw err;
    })
    .then(function(ur) {
      usuarioRevendedor = ur;
      return bcrypt.compare(senha, ur.get('senha'));
    })
    .then(function(valid) {
      if (valid) {
        return;
      }
      const err = new AreaAzul.AuthenticationError(
        'Usuário revendedor: senha incorreta', {
          login: login,
          usuario: usuarioRevendedor
        });
      log.warn(err.message, err.details);
      throw err;
    })
    .then(() => UsuarioRevendedor
      ._buscarPorId(usuarioRevendedor.id, null))
    .then(usuRev => usuRev.toJSON());
};
module.exports.inserir = function(camposUsuarioRevendedor) {
  return Bookshelf.transaction(function(t) {
    return UsuarioRevendedor._salvarUsuarioRevenda(
      camposUsuarioRevendedor, null, { transacting: t });
  })
    .then(usuRev => usuRev.toJSON());
};
module.exports.alterar = function(camposUsuarioRevendedor) {
  return Bookshelf.transaction(function(t) {
    const options = { transacting: t };
    return new UsuarioRevendedor({
      revendedor_id: camposUsuarioRevendedor.revendedor_id,
      login: camposUsuarioRevendedor.login
    })
      .fetch(options)
      .then(usuRev => UsuarioRevendedor
          ._salvarUsuarioRevenda(camposUsuarioRevendedor, usuRev, options));
  })
    .then(usuRev => usuRev.toJSON());
};

module.exports.desativar = function(id) {
  return Bookshelf.transaction(t => UsuarioRevendedor
    ._desativar(id, { transacting: t }))
    .then(usuRev => usuRev.toJSON());
};
module.exports.buscarPorId = function(id) {
  return UsuarioRevendedor
    ._buscarPorId(id, null)
    .then(usuRev => usuRev.toJSON());
};
module.exports.procurarLogin = function(login) {
  return UsuarioRevendedor
    ._procurarLogin(login, null)
    .then(usuRev => usuRev.toJSON());
};
