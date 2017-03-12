'use strict';

const moment = require('moment');
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
  let apos;
  if (req.query.minutos) {
    let minutos = Number(req.query.minutos);
    apos = moment().subtract(minutos, 'minutes').toDate();
  } else {
    apos = new Date();
  }
  AreaAzul.facade.Fiscalizacao
    .listar(apos)
    .then(function(fiscalizacoes) {
      res.send(fiscalizacoes);
    })
    .catch(function(result) {
      res.status(400).send('' + result);
    });
};
