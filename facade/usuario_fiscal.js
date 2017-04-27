const Bookshelf = require('../database');
const log = require('../logging');
const AreaazulUtils = require('areaazul-utils');
const UsuarioFiscal = Bookshelf.model('UsuarioFiscal');


module.exports.cadastrar = camposUsuarioFiscal => {
  log.info('UsuarioFiscal::cadastrar()', { parametros: AreaazulUtils.semSenhas(camposUsuarioFiscal) });
  return Bookshelf.transaction(t =>
    UsuarioFiscal
      ._cadastrar(camposUsuarioFiscal, { transacting: t })
      .then(usuFis => usuFis.toJSON()));
};


module.exports.autentico = (login, senha) =>
  UsuarioFiscal
    ._autentico(login, senha)
    .then(usuFis => usuFis.toJSON());


module.exports.buscarPorId = id =>
  UsuarioFiscal
    ._buscarPorId(id, null)
    .then(usuFis => usuFis.toJSON());
