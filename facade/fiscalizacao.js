'use strict';

const log = require('../logging');
const Bookshelf = require('../database');
const Fiscalizacao = Bookshelf.model('Fiscalizacao');
const Fiscalizacoes = Bookshelf.collection('Fiscalizacoes');
const moment = require('moment');

module.exports.listar = function(parameters) {
  return Fiscalizacoes
    .query(function(qb) {
      var params = parameters || {};
      if (params.minutos) {
        qb.where('timestamp', '>=',
          moment()
            .subtract(params.minutos, 'minutes')
            .calendar());
      }
      if (params.limite) {
        qb.limit(params.limite);
      }
      qb.orderBy('timestamp', 'desc');
    })
    .fetch()
    .then(ativacoes => {
      return ativacoes.toJSON();
    });
};

module.exports.cadastrar = function(fiscalizacao) {
  log.info('Fiscalizacao.cadastrar()', fiscalizacao);
  return new Fiscalizacao({
    placa: fiscalizacao.placa,
    latitude: fiscalizacao.latitude,
    longitude: fiscalizacao.longitude,
    timestamp: new Date(),
    usuario_fiscal_id: fiscalizacao.usuario_fiscal_id
  })
    .save()
    .then(fiscalizacao => {
      return fiscalizacao.toJSON();
    });
};
