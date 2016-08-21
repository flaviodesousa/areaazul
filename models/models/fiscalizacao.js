'use strict';

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
var log = AreaAzul.log;

var Fiscalizacao = Bookshelf.Model.extend({
  tableName: 'fiscalizacao'
}, {
  cadastrar: function(fiscalizacao) {
    log.info('Fiscalizacao.cadastrar()', fiscalizacao);
    return this
      .forge({
        placa: fiscalizacao.placa,
        latitude: fiscalizacao.latitude,
        longitude: fiscalizacao.longitude,
        timestamp: new Date(),
        usuario_fiscal_id: fiscalizacao.usuario_fiscal_id,
      })
      .save();
  },
});
Bookshelf.model('Fiscalizacao', Fiscalizacao);

module.exports = Fiscalizacao;
