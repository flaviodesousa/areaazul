'use strict';

const log = require('../logging');
const Bookshelf = require('../database');
const Fiscalizacao = Bookshelf.model('Fiscalizacao');


module.exports.listar = () =>
  Bookshelf.transaction(t =>
    Fiscalizacao
      ._listar({ transacting: t })
      .then(fiscalizacoes => fiscalizacoes.toJSON())
  );


module.exports.listarAtivas = (minutos = 5) =>
  Bookshelf.transaction(t =>
  Fiscalizacao
    ._listarAtivas(minutos, { transacting: t })
    .then(fiscalizacoes => fiscalizacoes.toJSON()));


module.exports.cadastrar = function(fiscalizacao) {
  log.info('Fiscalizacao::cadastrar()', fiscalizacao);
  return Bookshelf.transaction(t =>
    Fiscalizacao
      ._cadastrar(fiscalizacao, { transacting: t })
      .then(fiscalizacao => fiscalizacao.toJSON()));
};
