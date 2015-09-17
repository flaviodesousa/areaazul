'use strict';

var Bookshelf = require('bookshelf').conexaoMain;
var Veiculo = require('../models/veiculo');

var VeiculoCollection = Bookshelf.Collection.extend({
  model: Veiculo,
}, {

  procurar: function(vehicle, then, fail) {
    Veiculo.forge().query(function(qb) {
      qb.where('veiculo.id_veiculo', vehicle.id_veiculo);
      qb.join('estado', 'estado.id_estado', '=', 'veiculo.estado_id');
      qb.select('veiculo.*');
      qb.select('estado.*');
    }).fetch().then(function(collection) {
      then(collection);
    }).catch(function(err) {
      fail(err);
    });
  },
  
  
});


module.exports = VeiculoCollection;