'use strict';

module.exports = function() {
  var AreaAzul = require('areaazul');
  var Fiscalizacao = AreaAzul.models.Fiscalizacao;
  var Fiscalizacoes = AreaAzul.collections.Fiscalizacoes;

  return {
    registrar: function(req, res) {
      Fiscalizacao.cadastrar({
        fiscal_id: req.user.id,
        placa: req.body.placa,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
      }, function() {
        res.status(200).end();
      }, function(result) {
        res.status(400).send('' + result);
      });
    },
    listar: function(req, res) {
      var params = {};
      if (req.params.minutos) {
        params.minutos = Number(req.params.minutos);
      }
      if (req.params.limite) {
        params.limite = Number(req.params.limite);
      }
      Fiscalizacoes.listar(
        params,
        function(collection) {
          res.header('Access-Control-Allow-Origin', '*');
          res.send(collection.toJSON());
        },
        function(result) {
          res.status(400).send('' + result);
        });
    },
  };
};
