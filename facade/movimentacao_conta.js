const log = require('../logging');
const Bookshelf = require('../database');
const MovimentacaoConta = Bookshelf.model('MovimentacaoConta');

module.exports.listarMovimentacaoUsuario = function(id) {
  return new this()
    .query(function(qb) {
      qb
        .innerJoin('usuario', 'usuario.conta_id', 'movimentacao_conta.id')
        .where('usuario.id', id)
        .select('movimentacao_conta.*');
    })
    .fetch();
};

module.exports.inserirDebito = function(debito) {
  log.info('ovimentacao_conta::inserirDebito', debito);
  return Bookshelf.transaction(function(t) {
    return MovimentacaoConta
      ._inserirCredito(debito, { transacting: t });
  });
};

module.exports.inserirCredito = function(credito) {
  log.info('ovimentacao_conta::inserirCredito', credito);
  return Bookshelf.transaction(function(t) {
    return MovimentacaoConta
      ._inserirCredito(credito, { transacting: t });
  });
};
