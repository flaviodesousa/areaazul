const Bookshelf = require('../database');
const MovimentacaoConta = Bookshelf.model('MovimentacaoConta');

module.export.listarMovimentacaoUsuario = function(id) {
  return new this()
    .query(function(qb) {
      qb
        .innerJoin('usuario', 'usuario.conta_id', 'movimentacao_conta.id')
        .where('usuario.id', id)
        .select('movimentacao_conta.*');
    })
    .fetch();
};

module.export.inserirDebito = function(debito) {
  return Bookshelf.transaction(function(t) {
    return MovimentacaoConta
      ._inserirCredito(debito, { transacting: t });
  });
};

module.export.inserirCredito = function(credito) {
  return Bookshelf.transaction(function(t) {
    return MovimentacaoConta
      ._inserirCredito(credito, { transacting: t });
  });
};
