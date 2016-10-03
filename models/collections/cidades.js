'use strict';

const Promise = require('bluebird');
const AreaAzul = require('../../areaazul');
var Bookshelf = AreaAzul.db;
var Cidade = Bookshelf.model('Cidade');

var Cidades = Bookshelf.Collection.extend({
  model: Cidade
}, {
  listar: function(idEstado) {
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
  }
});
Bookshelf.collection('Cidades', Cidades);
