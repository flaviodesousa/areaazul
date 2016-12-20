'use strict';

const AreaAzul = require('areaazul');

module.exports.listar = function(req, res) {
  var filtro = {};
  if (req.query.estado) {
    filtro.idEstado = Number(req.query.estado);
  }
  if (req.query.termos) {
    filtro.termos = req.query.termos;
  }
  AreaAzul.facade.Cidade
    .listar(filtro)
    .then(function(listaCidades) {
      res.send(listaCidades);
    })
    .catch(function(result) {
      res.status(400).send('' + result);
    });
};
