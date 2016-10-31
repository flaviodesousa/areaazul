const log = require('../logging');
const Bookshelf = require('../database');
const MovimentacaoConta = Bookshelf.model('MovimentacaoConta');

module.exports.inserirDebito = function(debito) {
  log.info('ovimentacao_conta::inserirDebito', debito);
  return Bookshelf.transaction(function(t) {
    return MovimentacaoConta
      ._inserirDebito(debito, { transacting: t })
      .then(movimentacao => {
        return movimentacao.toJSON();
      });
  });
};

module.exports.inserirCredito = function(credito) {
  log.info('ovimentacao_conta::inserirCredito', credito);
  return Bookshelf.transaction(function(t) {
    return MovimentacaoConta
      ._inserirCredito(credito, { transacting: t })
      .then(movimentacao => {
        return movimentacao.toJSON();
      });
  });
};
