/**
 * Created by flavio on 10/10/16.
 */

const Bookshelf = require('../database');
const log = require('../logging');
const Ativacao = Bookshelf.model('Ativacao');
const Ativacoes = Bookshelf.collection('Ativacoes');

module.exports.ativar = function(camposAtivacao) {
  log.info('ativar', { ativacao: camposAtivacao });
  return Bookshelf.transaction(t =>
    Ativacao
      ._ativar(camposAtivacao, { transacting: t }))
    .then(ativacao => ativacao.toJSON());
};

module.exports.desativar = function(desativacao) {
  log.info('desativar', desativacao);
  return Bookshelf.transaction(t =>
    Ativacao
      ._desativar(desativacao, { transacting: t }))
    .then(desativacao => desativacao.toJSON());
};

module.exports.ativarPorRevenda = function(ativacao) {
  log.info('ativarPorRevenda()', ativacao);
  return Bookshelf.transaction(t =>
    Ativacao
      ._ativarPorRevenda(ativacao, { transacting: t }))
    .then(ativacao => ativacao.toJSON());
};

module.exports.listarAtivacoes = function() {
  return Bookshelf.transaction(t =>
    Ativacoes
      ._listarAtivacoes())
    .then(ativacoes => ativacoes.toJSON());
};
