const log = require('../logging');
const Bookshelf = require('../database');
const Revendedor = Bookshelf.model('Revendedor');
const AreaazulUtils = require('areaazul-utils');

module.exports.cadastrar = function(camposRevendedor) {
  log.info('revendedor::cadastrar()',
    AreaazulUtils.semSenhas(camposRevendedor));
  return Bookshelf.transaction(t =>
    Revendedor
      ._cadastrar(camposRevendedor, { transacting: t })
      .then(revendedor => {
        return revendedor.toJSON();
      })
  );
};

module.exports.buscarPorId = id =>
  Revendedor._buscarPorId(id)
    .then(revenda => revenda.toJSON());

module.exports.buscarPorIdUsuarioRevendedor = id =>
  Revendedor._buscarPorIdUsuarioRevendedor(id)
    .then(revenda => revenda.toJSON());

module.exports.comprarCreditos = camposCompra => {
  log.info('revendedor::comprarCreditos', camposCompra);
  return Bookshelf.transaction(t =>
    Revendedor
      ._comprarCreditos(camposCompra, { transacting: t }))
    .then(movimentacao => movimentacao.toJSON());
};

module.exports.venderCreditos = camposVenda => {
  log.info('revendedor::venderCreditos', camposVenda);
  return Bookshelf.transaction(t =>
    Revendedor
      ._venderCreditos(camposVenda, { transacting: t }))
    .then(movimentacao => movimentacao.toJSON());
};
