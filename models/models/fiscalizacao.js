'use strict';

var AreaAzul = require('../../areaazul');
var log = AreaAzul.log;
var Bookshelf = require('bookshelf').conexaoMain;

module.exports = Bookshelf.Model.extend({
  tableName: 'fiscalizacao',
  idAttribute: 'id_fiscalizacao',
}, {
  cadastrar: function(params, then, fail) {
    this
      .forge({
        placa: params.placa,
        latitude: params.latitude,
        longitude: params.longitude,
        timestamp: new Date(),
        fiscal_id: params.fiscal_id,
      })
      .save()
      .then(function(model) {
        log.info('Fiscalizacao adicionada', model);
        then(model);
      })
      .catch(function(err) {
        log.error('Fiscalizacao', {params: params, err: err});
        fail(err);
      });
  },
});
