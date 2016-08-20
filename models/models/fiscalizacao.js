'use strict';

var AreaAzul = require('../../areaazul');
var log = AreaAzul.log;
var Bookshelf = require('bookshelf').conexaoMain;

var Fiscalizacao = Bookshelf.Model.extend({
  tableName: 'fiscalizacao'
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
        log.info('Fiscalizacao adicionada', {model: model});
        then(model);
      })
      .catch(function(err) {
        log.error('Fiscalizacao', {params: params, err: err});
        fail(err);
      });
  },
});
Bookshelf.model('Fiscalizacao', Fiscalizacao);

module.exports = Fiscalizacao;
