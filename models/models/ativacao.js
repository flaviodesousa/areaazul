'use strict';

var validator = require('validator');
var Bookshelf = require('bookshelf').conexaoMain;
var Usuario = require('./usuario');
var Revendedor = require('./revendedor');

var Ativacao = Bookshelf.Model.extend({
  tableName: 'ativacao',
  idAttribute: 'id_ativacao',

ativar: function(activation, then, fail) {

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

  var ativacao = new this.Ativacao({
    data_ativacao: new Date(),
    latitude: latitude,
    longitude: longitude,
    altitude: altitude,
    usuario_id: activation.usuario_id,
    veiculo_id: activation.veiculo_id,
    ativo: true,
  });

  ativacao.save().then(function(model) {
    then(model);
  }).catch(function(err) {
    fail(err);
  });

}
},{
ativarPelaRevenda: function(car, then, fail) {

  var ativacao = new this.Ativacao({
    data_ativacao: new Date(),
    usuario_id: car.usuario_id,
    veiculo_id: car.veiculo_id,
    ativo: true,
  });

  var usuario = new Usuario.Usuario({
    id_usuario: car.usuario_id,
  });

  Revendedor.buscarRevendedor(usuario,
        function() {
          ativacao.save().then(function(model) {
            then(model);
          }).catch(function(err) {
            fail(err);
          });
        },
        function(result) {
          fail(result);
  });
}

});

module.exports = Ativacao;

