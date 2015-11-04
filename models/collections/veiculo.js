'use strict';

var Bookshelf = require('bookshelf').conexaoMain;
var Veiculo = require('../models/veiculo');

var VeiculoCollection = Bookshelf.Collection.extend({
  model: Veiculo,
}, {

  procurar: function(vehicle, then, fail) {
    Veiculo.forge().query(function(qb) {
      qb.where('veiculo.id_veiculo', vehicle.id_veiculo);
      qb.join('cidade', 'cidade.id_cidade', '=', 'veiculo.cidade_id');
      qb.select('veiculo.*');
      qb.select('cidade.*');
    }).fetch().then(function(collection) {
      then(collection);
    }).catch(function(err) {
      fail(err);
    });
  },

  listar: function(func) {
        VeiculoCollection.forge().query(function(qb) {
            qb.select('veiculo.*')
        }).fetch().then(function(collection) {
            func(collection);
        });
    },
  
  
});


module.exports = VeiculoCollection;