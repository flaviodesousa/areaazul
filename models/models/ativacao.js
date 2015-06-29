'use strict';

var AreaAzul = require('../../areaazul');
var log = AreaAzul.log;
var _ = require('lodash');
var validator = require('validator');
var Bookshelf = require('bookshelf').conexaoMain;
var Revendedor = require('./revendedor');
var UsuarioHasVeiculo = require('./usuario_has_veiculo');

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
      var optionsInsert = { transacting: t, method: 'insert' };
      var optionsUpdate = { transacting: t, method: 'update', patch: true };
      var ativacao;

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
        .then(function(a) {
          ativacao = a;
          return UsuarioHasVeiculo
            .forge({
              usuario_pessoa_id: activation.usuario_pessoa_id,
              veiculo_id: activation.veiculo_id,
            })
            .fetch()
            .then(function(usuariohasveiculo) {
              if (usuariohasveiculo === null) {
                return UsuarioHasVeiculo
                  .forge({
                    usuario_pessoa_id: activation.usuario_pessoa_id,
                    veiculo_id: activation.veiculo_id,
                    ultima_ativacao: new Date(),
                  })
                  .save(null, optionsInsert);
              } else {
                return usuariohasveiculo
                  .save({ultima_ativacao: new Date() }, optionsUpdate);
              }
            });
        })
        .then(function() {
          return ativacao;
        });
    });
  },

  desativar: function(desativacao) {
    return Ativacao
      .forge({
        id_ativacao: desativacao.id_ativacao,
        usuario_pessoa_id: desativacao.usuario_pessoa_id,
      })
      .fetch()
      .then(function(d) {
        if (!d) {
          var err = new AreaAzul.BusinessException(
            'Desativacao: Ativacao nao reconhecida',
            {desativacao: desativacao});
          log.error(err.message, err.details);
          throw err;
        }
        return d;
      })
      .then(function(d) {
        return d
          .save({data_desativacao: new Date()}, {patch: true});
      })
      .then(function(ativacaoExistente) {
        log.info('Desativacao: sucesso', {desativacao: ativacaoExistente});
        return ativacaoExistente;
      });
  },

  ativarPelaRevenda: function(car, then, fail) {
    Revendedor.buscarRevendedor({pessoa_id: car.revendedor_id},
      function() {
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
      function(result) {
        fail(result);
      });
  },

});

module.exports = Ativacao;

