const log = require('../logging');
const Bookshelf = require('../database');
const Revendedor = Bookshelf.model('Revendedor');

module.exports.cadastrar = function(revendedor) {
  log.info('revendedor::cadastrar()', revendedor);
  return Bookshelf.transaction(function(t) {
    return Revendedor._cadastrar(revendedor, { transacting: t });
  });
};
module.exports.buscarRevendedor = function(user) {
  return Revendedor
    .forge()
    .query(function(qb) {
      qb.join('pessoa', 'pessoa.id', 'revendedor.id')
        .join('usuario_revendedor', 'usuario_revendedor.revendedor_id',
          'revendedor.id')
        .join('conta', 'conta.id', 'revendedor.conta_id')
        .where('usuario_revendedor.pessoa_fisica_id', user.pessoa_fisica_id)
        .select('revendedor.*', 'usuario_revendedor.*', 'pessoa.*',
          'conta.*');
    })
    .fetch();
};
module.exports.validarRevenda = revenda => {
  return Bookshelf.transaction(t => {
    return Revendedor._validarRevenda(revenda, { transacting: t });
  });
};
