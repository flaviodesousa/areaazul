'use strict';

const AreaAzul = require('areaazul');

module.exports.listar = function(req, res) {
  var estado;
  if (req.query.estado) {
    estado = Number(req.query.estado);
  }
  AreaAzul.facade.Cidade
    .listar(estado)
    .then(function(cidades) {
      res.send(cidades);
    })
    .catch(function(result) {
      res.status(400).send('' + result);
    });
};
