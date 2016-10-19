/**
 * Created by flavio on 10/10/16.
 */

const Bookshelf = require('../database');
const log = require('../logging');
const Ativacao = Bookshelf.model('Ativacao');

module.exports.ativar = function(camposAtivacao) {
  log.info('ativar', { ativacao: camposAtivacao });

  return Bookshelf.transaction(function(t) {
    return Ativacao
      ._ativar(camposAtivacao, { transacting: t })
      .then(ativacao => {
        return ativacao.toJSON();
      });
  });
};

module.exports.desativar = function(desativacao) {
  log.info('desativar', desativacao);
  return Bookshelf.transaction(function(t) {
    var options = { transacting: t };
    return Ativacao
      ._desativar(desativacao, options)
      .then(desativacao => {
        return desativacao.toJSON();
      });
  });
};

module.exports.ativarPelaRevenda = function(ativacao) {
  log.info('ativarPelaRevenda()', ativacao);
  return Bookshelf.transaction(function(t) {
    return Ativacao
      ._ativarPelaRevenda(ativacao, { transacting: t })
      .then(ativacao => {
        return ativacao.toJSON();
      });
  });
};

module.exports.getAtivacoes = () => {};
module.exports.getVeiculos = () => {};
module.exports.getSaldo = () => {};
module.exports.getHistorico = () => {};
