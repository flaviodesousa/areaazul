'use strict';

const log = require('../logging');
const Bookshelf = require('../database');
const Fiscalizacao = Bookshelf.model('Fiscalizacao');

module.exports.listar = function() {
  return Fiscalizacao
    ._listar()
    .then(fiscalizacoes => {
      return fiscalizacoes.toJSON();
    });
};

module.exports.listarAtivas = function(minutos = 5) {
  return Fiscalizacao
    ._listarAtivas(minutos)
    .then(fiscalizacoes => {
      return fiscalizacoes.toJSON();
    });
};

module.exports.cadastrar = function(fiscalizacao) {
  log.info('Fiscalizacao.cadastrar()', fiscalizacao);
  return Fiscalizacao.
    _cadastrar(fiscalizacao)
    .then(fiscalizacao => fiscalizacao.toJSON());
};
