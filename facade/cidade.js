/**
 * Created by flavio on 10/10/16.
 */

const Promise = require('bluebird');
const AreaAzul = require('../areaazul');
const Bookshelf = require('../database');
const Cidades = Bookshelf.collection('Cidades');

module.export.listar = function(idEstado) {
  if (idEstado && idEstado !== 0 + idEstado) {
    return Promise.reject(
      new AreaAzul.BusinessException(
        'idEstado deve ser numérico',
        { idEstado: idEstado }));
  }
  return Cidades
    .query(function(qb) {
      if (idEstado) {
        qb.where('estado_id', '=', idEstado);
      }
    })
    .fetch({ withRelated: 'estado' });
};
