/**
 * Created by flavio on 10/10/16.
 */

const Bookshelf = require('../database');
const log = require('../logging');
const Ativacao = Bookshelf.model('Ativacao');

module.exports.ativar = function(ativacao) {
  log.info('ativar', { ativacao: ativacao });

  return Bookshelf.transaction(function(t) {
    var options = { transacting: t };
    return Ativacao._ativar(ativacao, options);
  });
};

module.exports.desativar = function(desativacao) {
  log.info('desativar', desativacao);
  return Bookshelf.transaction(function(t) {
    var options = { transacting: t };
    return Ativacao._desativar(desativacao, options);
  });
};

module.exports.ativarPelaRevenda = function(ativacao) {
  log.info('ativarPelaRevenda()', ativacao);
  return Bookshelf.transaction(function(t) {
    return Ativacao._ativarPelaRevenda(ativacao, { transacting: t });
  });
};
