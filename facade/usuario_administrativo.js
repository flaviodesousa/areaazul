const log = require('../logging');
const AreaazulUtils = require('areaazul-utils');
const Bookshelf = require('../database');
const UsuarioAdministrativo = Bookshelf.model('UsuarioAdministrativo');

module.exports.cadastrar = function(camposUsuarioAdministrativo) {
  log.info('UsuarioAdministrativo::cadastrar()', { parametros: AreaazulUtils.semSenhas(camposUsuarioAdministrativo) });
  return Bookshelf.transaction(t =>
    UsuarioAdministrativo
      ._cadastrar(camposUsuarioAdministrativo, { transacting: t }))
    .then(usuarioAdministrativo => usuarioAdministrativo.toJSON());
};
module.exports.autentico = function(login, senha) {
  return UsuarioAdministrativo
    ._autentico(login, senha)
    .then(usuAdm => usuAdm.toJSON());
};

module.exports.buscarPorId = function(id) {
  return UsuarioAdministrativo
    ._buscarPorId(id, null)
    .then(usuAdm => usuAdm.toJSON());
};
