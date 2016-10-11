const log = require('../logging');
const Bookshelf = require('../database');
const Revendedor = Bookshelf.model('Revendedor');

module.export.cadastrar = function(revendedor) {
  log.info('revendedor::cadastrar()', revendedor);
  var Revendedor = this;
  return Bookshelf.transaction(function(t) {
    return Revendedor._cadastrar(revendedor, { transacting: t });
  });
};
module.export.buscarRevendedor = function(user) {
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
