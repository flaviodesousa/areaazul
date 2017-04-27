const log = require('../logging');
const AreaazulUtils = require('areaazul-utils');

const Bookshelf = require('../database');
const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
const UsuariosRevendedores = Bookshelf.collection('UsuariosRevendedores');


function _listarPorRevenda(idRevendedor) {
  return new UsuariosRevendedores()
    .query({ where: { revendedor_id: idRevendedor } })
    .fetch({
      withRelated: [
        'revendedor', 'pessoaFisica', 'pessoaFisica.pessoa' ]
    });
}


module.exports.listarPorRevenda = function(idRevendedor) {
  return _listarPorRevenda(idRevendedor)
    .then(lista => lista.toJSON());
};


module.exports.autentico = (login, senha) =>
  UsuarioRevendedor
    ._autentico(login, senha)
    .then(usuRev => usuRev.toJSON());


module.exports.inserir = function(camposUsuarioRevendedor) {
  log.info('UsuarioRevendedor::cadastrar()', { parametros: AreaazulUtils.semSenhas(camposUsuarioRevendedor) });
  return Bookshelf.transaction(t =>
    UsuarioRevendedor
      ._salvarUsuarioRevenda(camposUsuarioRevendedor, null, { transacting: t }))
    .then(usuRev => usuRev.toJSON());
};


module.exports.alterar = function(camposUsuarioRevendedor) {
  log.info('UsuarioRevendedor::alterar()', { parametros: AreaazulUtils.semSenhas(camposUsuarioRevendedor) });
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
  log.info('UsuarioRevendedor::cadastrar()', { id: id });
  return Bookshelf.transaction(t =>
    UsuarioRevendedor
      ._desativar(id, { transacting: t }))
    .then(usuRev => usuRev.toJSON());
};


module.exports.buscarPorId = function(id) {
  return UsuarioRevendedor
    ._buscarPorId(id, null)
    .then(usuRev => usuRev.toJSON());
};


module.exports.buscarPorLogin = function(login) {
  return UsuarioRevendedor
    ._procurarLogin(login, null)
    .then(usuRev => usuRev.toJSON());
};
