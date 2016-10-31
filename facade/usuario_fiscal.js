const Bookshelf = require('../database');
const log = require('../logging');
const AreaazulUtils = require('areaazul-utils');
const UsuarioFiscal = Bookshelf.model('UsuarioFiscal');

module.exports.cadastrar = function(camposUsuarioFiscal) {
  log.info('UsuarioFiscal::cadastrar()', AreaazulUtils.semSenhas(camposUsuarioFiscal));
  return Bookshelf.transaction(function(t) {
    return UsuarioFiscal
      ._cadastrar(camposUsuarioFiscal, { transacting: t })
      .then(usuFis => usuFis.toJSON());
  });
};
module.exports.autentico = function(login, senha) {
  return UsuarioFiscal
    ._autentico(login, senha)
    .then(usuFis => usuFis.toJSON());
};
module.exports.buscarPorId = function(id) {
  return UsuarioFiscal
    ._buscarPorId(id, null)
    .then(usuFis => usuFis.toJSON());
};
