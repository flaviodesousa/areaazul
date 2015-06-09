'use strict';

var _ = require('lodash');
var validator = require('validator');
var Bookshelf = require('bookshelf').conexaoMain;
var Usuario = require('./usuario');
var Revendedor = require('./revendedor');

var Ativacao = Bookshelf.Model.extend({
  tableName: 'ativacao',
  idAttribute: 'id_ativacao',

}, {

  ativar: function(activation) {

    var latitude = activation.latitude;
    var altitude = activation.longitude;
    var longitude = activation.altitude;

    if (validator.isNull(latitude)) {
      latitude = null;
    }
    if (validator.isNull(longitude)) {
      longitude = null;
    }
    if (validator.isNull(altitude)) {
      altitude = null;
    }

    return Bookshelf.transaction(function(t) {
      var options = { transacting: t };
      var optionsInsert = _.merge(options, { method: 'insert' });

      return Ativacao
        .forge({
          data_ativacao: new Date(),
          latitude: latitude,
          longitude: longitude,
          altitude: altitude,
          usuario_pessoa_id: activation.usuario_pessoa_id,
          veiculo_id: activation.veiculo_id,
          ativo: true,
        })
        .save(null, optionsInsert)
        .then(function(ativacao) {

          return ativacao;
        });
    });

  },

  ativarPelaRevenda: function(car, then, fail) {
      Revendedor.buscarRevendedor({pessoa_id: car.revendedor_id},
      function(){
        return Bookshelf.transaction(function(t) {
          var options = { transacting: t };
          var optionsInsert = _.merge(options, { method: 'insert' });

          return Ativacao
                .forge({
                    data_ativacao: new Date(),
                    usuario_pessoa_id: car.usuario_pessoa_id,
                    veiculo_id: car.veiculo_id,
                    ativo: true,
                })
                .save(null, optionsInsert)
                .then(
                  function(ativacao) {
                  then(ativacao);
                });
        });
      },
      function(result){
        fail(result);
      });
  },

});

module.exports = Ativacao;

