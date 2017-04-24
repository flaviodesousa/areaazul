'use strict';

const AreaAzul = require('../areaazul');

module.exports.registrar = function(req, res) {
  AreaAzul.facade.Fiscalizacao
    .cadastrar({
      usuario_fiscal_id: req.user.id,
      placa: req.body.placa,
      latitude: req.body.latitude,
      longitude: req.body.longitude
    })
    .then(function() {
      res.status(201).end();
    })
    .catch(function(result) {
      res.status(400).send('' + result);
    });
};

module.exports.listar = function(req, res) {
  AreaAzul.facade.Fiscalizacao
    .listar()
    .then(function(fiscalizacoes) {
      res.send(fiscalizacoes);
    })
    .catch(function(result) {
      res.status(400).send('' + result);
    });
};
